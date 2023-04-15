import vscode from 'vscode';

import { fetchDevicesToInspect, askDeviceByName } from './expo/bundler';
import { ExpoProjectCache, ExpoProject, findProjectFromWorkspaces } from './expo/project';
import { debug } from './utils/debug';

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
  constructor(extension: vscode.ExtensionContext, protected projects: ExpoProjectCache) {
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
        return log('No relative project path entered, aborting...');
      }

      project = findProjectFromWorkspaces(this.projects, projectRelativePath);
    }

    if (!project) {
      return vscode.window.showErrorMessage(
        projectRelativePath
          ? `Could not find any Expo projects in: ${projectRelativePath}`
          : `Could not find any Expo projects in the current workspaces`
      );
    }

    log('Resolved dynamic project configuration for:', project.root);

    return vscode.debug.startDebugging(undefined, {
      type: DEBUG_TYPE,
      request: 'attach',
      name: 'Inspect Expo app',
      projectRoot: project.root,
    });
  }

  provideDebugConfigurations(workspace?: vscode.WorkspaceFolder, token?: vscode.CancellationToken) {
    const project = findProjectFromWorkspaces(this.projects);
    const workflow = project?.resolveWorkflow();

    return [
      {
        type: DEBUG_TYPE,
        request: 'attach',
        name: 'Inspect Expo app',
        projectRoot: project?.root ?? '${workspaceFolder}',
        bundlerHost: '127.0.0.1',
        bundlerPort: workflow === 'managed' ? '19000' : '8081',
      },
    ];
  }

  async resolveDebugConfiguration(
    workspace: vscode.WorkspaceFolder | undefined,
    config: ExpoDebugConfig,
    token?: vscode.CancellationToken
  ) {
    if (config.request === 'launch') {
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
      resolveSourceMapLocations: ['!**/__prelude__', '!webpack:**'],
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
    const workflow = project?.resolveWorkflow();

    if (!project) {
      throw new Error('Could not resolve Expo project: ' + config.projectRoot);
    }

    // Reuse the validated project root as cwd
    config.cwd = config.projectRoot;

    // Infer the bundler address from project workflow
    config.bundlerHost = config.bundlerHost ?? '127.0.0.1';
    config.bundlerPort = config.bundlerPort ?? (workflow === 'managed' ? '19000' : '8081');

    // Resolve the target device config to inspect
    const deviceConfig = await resolveDeviceConfig(config, project);

    return { ...config, ...deviceConfig };
  }
}

async function resolveDeviceConfig(config: ExpoDebugConfig, project: ExpoProject) {
  const device = await waitForDevice(config);
  if (!device) {
    throw new Error('Expo debug session aborted.');
  }

  return {
    // The address of the device to connect to
    websocketAddress: device.webSocketDebuggerUrl,

    // Define the required root paths to resolve source maps
    localRoot: project.root,
    remoteRoot: `http://${config.bundlerHost}:${config.bundlerPort}`,
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
  const devices = await fetchDevicesToInspect(
    `http://${config.bundlerHost}:${config.bundlerPort}`
  ).catch(() => {
    throw new Error(`waiting for bundler on ${config.bundlerHost}:${config.bundlerPort}...`);
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
