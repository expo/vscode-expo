import vscode from 'vscode';

import {
  fetchDevicesToInspect,
  askDeviceByName,
  inferDevicePlatform,
  fetchDevicesToInspectFromUnknownWorkflow,
} from './expo/bundler';
import { ExpoProjectCache, ExpoProject, findProjectFromWorkspaces } from './expo/project';
import { debug } from './utils/debug';
import { featureTelemetry } from './utils/telemetry';

const log = debug.extend('expo-debuggers');

const DEBUG_TYPE = 'expo';
const DEBUG_COMMAND = 'expo.debug.start';

interface ExpoDebugConfig extends vscode.DebugConfiguration {
  projectRoot: string;
  bundlerHost?: string;
  bundlerPort?: string;
  // Inherited config from `pwa-node`
  trace?: boolean;
  restart?: boolean;
  enableTurboSourcemaps?: boolean;
}

export class ExpoDebuggersProvider implements vscode.DebugConfigurationProvider {
  constructor(
    extension: vscode.ExtensionContext,
    protected projects: ExpoProjectCache
  ) {
    extension.subscriptions.push(
      vscode.debug.registerDebugConfigurationProvider(
        DEBUG_TYPE,
        this,
        vscode.DebugConfigurationProviderTriggerKind.Dynamic
      )
    );

    extension.subscriptions.push(
      vscode.commands.registerCommand(DEBUG_COMMAND, () => this.onDebugCommand())
    );
  }

  async onDebugCommand() {
    let project = findProjectFromWorkspaces(this.projects);
    let projectRelativePath: string | undefined = '';

    if (!project) {
      projectRelativePath = await vscode.window.showInputBox({
        title: 'Expo Debugger',
        prompt: 'Enter the path to the Expo project',
        value: './',
      });

      // Abort silently if nothing was entered
      if (!projectRelativePath) {
        featureTelemetry('command', `${DEBUG_COMMAND}/aborted`, { reason: 'no-path' });
        return log('No relative project path entered, aborting...');
      }

      project = findProjectFromWorkspaces(this.projects, projectRelativePath);
    }

    if (!project) {
      featureTelemetry('command', `${DEBUG_COMMAND}/aborted`, { reason: 'no-project' });
      return vscode.window.showErrorMessage(
        projectRelativePath
          ? `Could not find any Expo projects in: ${projectRelativePath}`
          : `Could not find any Expo projects in the current workspaces`
      );
    }

    log('Resolved dynamic project configuration for:', project.root);
    featureTelemetry('command', DEBUG_COMMAND, {
      path: projectRelativePath ? 'nested' : 'workspace',
    });

    return vscode.debug.startDebugging(undefined, {
      type: DEBUG_TYPE,
      request: 'attach',
      name: 'Inspect Expo app',
      projectRoot: project.root,
    });
  }

  provideDebugConfigurations(workspace?: vscode.WorkspaceFolder, token?: vscode.CancellationToken) {
    const project = findProjectFromWorkspaces(this.projects);

    return [
      {
        type: DEBUG_TYPE,
        request: 'attach',
        name: 'Inspect Expo app',
        projectRoot: project?.root ?? '${workspaceFolder}',
        bundlerHost: '127.0.0.1',
        bundlerPort: undefined,
      },
    ];
  }

  async resolveDebugConfiguration(
    workspace: vscode.WorkspaceFolder | undefined,
    config: ExpoDebugConfig,
    token?: vscode.CancellationToken
  ) {
    if (config.request === 'launch') {
      featureTelemetry('debugger', `${DEBUG_TYPE}/aborted`, { reason: 'launch' });
      throw new Error(
        'Expo debugger does not support launch mode yet. Start the app manually, and connect through `attach`.'
      );
    }

    return {
      type: 'pwa-node',
      request: 'attach',
      name: config.name ?? 'Debug Expo app',

      // Pass the user-provided configuration
      projectRoot: config.projectRoot ?? '${workspaceFolder}',
      bundlerHost: config.bundlerHost,
      bundlerPort: config.bundlerPort,

      // Enable sourcemaps
      sourceMap: true,
      pauseForSourceMap: true,
      // Enable source-loading for `node_modules`, when using `expo/AppEntry.js`
      outFiles: [],
      // But disable certain attempts to resolve non-existing source code
      resolveSourceMapLocations: [
        '!**/__prelude__/**',
        '!webpack:**',
        '!**/node_modules/react-devtools-core/**',
      ],
      // Disable some internal webpack source-mapping, mostly for React DevTools Backend
      sourceMapPathOverrides: {},

      // Enable the CDP tracer
      trace: config.trace ?? false,
      // Attach to whatever processes is running in Hermes
      attachExistingChildren: true,
      // When Hermes/app or the inspector unexpectedly disconnects, close the debug session
      restart: config.restart ?? false,
      // Speed up the sourcemap loading, it's kind of experimental in `vscode-js-debug`, but does work fine eiher way
      enableTurboSourcemaps: config.enableTurboSourcemaps ?? true,
    };
  }

  async resolveDebugConfigurationWithSubstitutedVariables(
    workspace: vscode.WorkspaceFolder | undefined,
    config: ExpoDebugConfig,
    token?: vscode.CancellationToken
  ) {
    const project = this.projects.maybeFromRoot(config.projectRoot);

    if (!project) {
      featureTelemetry('debugger', `${DEBUG_TYPE}/aborted`, { reason: 'no-project' });
      throw new Error('Could not resolve Expo project: ' + config.projectRoot);
    }

    // Reuse the validated project root as cwd
    config.cwd = config.projectRoot;

    // Infer the bundler address from project workflow
    config.bundlerHost = config.bundlerHost ?? '127.0.0.1';
    config.bundlerPort = config.bundlerPort ?? undefined;

    // Resolve the target device config to inspect
    const { platform, workflow, ...deviceConfig } = await resolveDeviceConfig(config, project);

    featureTelemetry('debugger', `${DEBUG_TYPE}`, { platform, workflow });

    return { ...config, ...deviceConfig };
  }
}

async function resolveDeviceConfig(config: ExpoDebugConfig, project: ExpoProject) {
  const device = await waitForDevice(config);
  if (!device) {
    featureTelemetry('debugger', `${DEBUG_TYPE}/aborted`, { reason: 'device-canceled' });
    throw new Error('Expo debug session aborted.');
  }

  return {
    platform: inferDevicePlatform(device) ?? 'unknown',
    workflow: device._workflow,

    // The address of the device to connect to
    websocketAddress: `${device.webSocketDebuggerUrl}&type=vscode`,

    // Define the required root paths to resolve source maps
    localRoot: project.root,
    remoteRoot: `http://${config.bundlerHost}:${config.bundlerPort ?? 8081}`,
  };
}

async function waitForDevice(config: ExpoDebugConfig) {
  return await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, cancellable: true, title: 'Expo debug' },
    async (progress, token) => {
      progress.report({ message: 'connecting to bundler...' });

      while (!token.isCancellationRequested) {
        try {
          return await pickDevice(config);
        } catch (error) {
          progress.report({ message: error.message });
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  );
}

async function pickDevice(config: ExpoDebugConfig) {
  const bundlerHost = config.bundlerHost ?? '127.0.0.1';

  // Either fetch from user-specified port, or try both `19000` and `8081`.
  const devices = config.bundlerPort
    ? await fetchDevicesToInspect({ host: bundlerHost, port: config.bundlerPort }).catch(() => {
        throw new Error(`waiting for bundler on ${config.bundlerHost}:${config.bundlerPort}...`);
      })
    : await fetchDevicesToInspectFromUnknownWorkflow({ host: bundlerHost }).catch(() => {
        throw new Error(`waiting for bundler on ${config.bundlerHost}...`);
      });

  if (devices.length === 1) {
    log('Picking only device available:', devices[0].deviceName ?? 'Unknown device');
    return devices[0];
  }

  if (devices.length > 1) {
    log('Asking user to pick device by name...');
    return await askDeviceByName(devices);
  }

  throw new Error('waiting for device to connect...');
}
