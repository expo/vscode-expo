import fs from 'fs';
import vscode from 'vscode';

import { fetchDevicesToInspect, askDeviceByName, inferDevicePlatform } from './expo/bundler';
import {
  ExpoProjectCache,
  ExpoProject,
  findProjectFromWorkspaces,
  findProjectFromWorkspace,
} from './expo/project';
import { debug } from './utils/debug';
import { featureTelemetry } from './utils/telemetry';

const log = debug.extend('expo-debuggers');

const DEBUG_TYPE = 'expo';
const DEBUG_COMMAND = 'expo.debug.start';
const DEBUG_USER_AGENT = `vscode/${vscode.version} ${process.env.EXTENSION_NAME}/${process.env.EXTENSION_VERSION}`;

export interface ExpoDebugConfig extends vscode.DebugConfiguration {
  projectRoot: string;
  bundlerHost?: string;
  bundlerPort?: string;
  // Inherited config from `pwa-node`
  trace?: boolean;
  restart?: boolean;
  enableTurboSourcemaps?: boolean;
  skipFiles?: string[];
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
    let project = await findProjectFromWorkspaces(this.projects);
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

      project = await findProjectFromWorkspaces(this.projects, projectRelativePath);
    }

    if (!project) {
      featureTelemetry('command', `${DEBUG_COMMAND}/aborted`, { reason: 'no-project' });
      return vscode.window.showErrorMessage(
        projectRelativePath
          ? `Could not find any Expo projects in: ${projectRelativePath}`
          : `Could not find any Expo projects in the current workspaces`
      );
    }

    log('Resolved dynamic project configuration for:', project.root.fsPath);
    featureTelemetry('command', DEBUG_COMMAND, {
      path: projectRelativePath ? 'nested' : 'workspace',
    });

    return vscode.debug.startDebugging(undefined, {
      type: DEBUG_TYPE,
      request: 'attach',
      name: 'Inspect Expo app',
      projectRoot: project.root.fsPath,
    });
  }

  async provideDebugConfigurations(
    workspace?: vscode.WorkspaceFolder,
    token?: vscode.CancellationToken
  ) {
    const project = workspace
      ? await findProjectFromWorkspace(this.projects, workspace)
      : await findProjectFromWorkspaces(this.projects);

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
      type: DEBUG_TYPE,
      request: 'attach',
      name: config.name ?? 'Debug Expo app',

      // Pass the user-provided configuration
      projectRoot: config.projectRoot ?? '${workspaceFolder}',
      bundlerHost: config.bundlerHost,
      bundlerPort: config.bundlerPort,

      // Enable sourcemaps
      sourceMap: true,
      pauseForSourceMap: true,
      // Pass-down skipped files,
      skipFiles: config.skipFiles ?? undefined,
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
      // Allow mocking the `host: <url>` when connecting as debugger
      remoteHostHeader: config.remoteHostHeader ?? undefined,
    };
  }

  async resolveDebugConfigurationWithSubstitutedVariables(
    workspace: vscode.WorkspaceFolder | undefined,
    config: ExpoDebugConfig,
    token?: vscode.CancellationToken
  ) {
    const project = await this.projects.fromRoot(vscode.Uri.file(config.projectRoot));

    if (!project) {
      featureTelemetry('debugger', `${DEBUG_TYPE}/aborted`, { reason: 'no-project' });
      throw new Error('Could not resolve Expo project: ' + config.projectRoot);
    }

    // Reuse the pwa-node debug adapter from vscode.js-debug
    config.type = 'pwa-node';

    // Reuse the validated project root as cwd
    config.cwd = config.projectRoot;

    // Infer the bundler address from project workflow
    config.bundlerHost ??= '127.0.0.1';
    config.bundlerPort ??= undefined;

    // `vscode.js-debug` adds a `host: <url>` header when connecting through CDP, which is set to `localhost` by default.
    // Right now, we still have an inspector proxy, meaning that the URLs for devices are slightly different compared to debuggers.
    // React Native tries to ease the pain here by automatically converting certain URLs to be "debugger-relative".
    // Unfortunately, this translation mechanism isn't correct with the default `vscode.js-debug` value `localhost`.
    // Using `localhost` instead of `<host>:<port>` causes `Debugger.scriptParsed` event URLs to be converted to `http://localhost/...`.
    // Which in turn causes `vscode.js-debug` to fail with "source map could not be loaded".
    // See: https://github.com/facebook/react-native/blame/dd1f83e61656f21769bd66b28a4c389d6ec31a72/packages/dev-middleware/src/utils/getBaseUrlFromRequest.js#L25
    // See: https://github.com/microsoft/vscode-js-debug/commit/7c1e48388190e99a275c81be3c25c3a3a9c3b562
    config.remoteHostHeader ??= `${config.bundlerHost}:${config.bundlerPort}`;

    // Workaround for Window's drive letter case mismatch with source maps
    if (process.platform === 'win32') {
      const projectRoot = await resolveWindowsProjectRoot(config.projectRoot);

      // Replace the project root for all source maps related paths.
      config.cwd = projectRoot;
      config.projectRoot = projectRoot;
      config.rootPath = projectRoot;
    }

    // Resolve the target device config to inspect
    const { platform, deviceName, ...deviceConfig } = await resolveDeviceConfig(config, project);

    featureTelemetry('debugger', `${DEBUG_TYPE}`, {
      platform,
      deviceName,
      expoVersion: project.expoVersion,
    });

    return { ...config, ...deviceConfig };
  }
}

async function resolveDeviceConfig(config: ExpoDebugConfig, project: ExpoProject) {
  const device = await waitForDevice(config);
  if (!device) {
    featureTelemetry('debugger', `${DEBUG_TYPE}/aborted`, { reason: 'device-canceled' });
    throw new Error('Expo debug session aborted.');
  }

  const platform = inferDevicePlatform(device);

  return {
    platform: platform ?? 'unknown',
    deviceName: platform ? undefined : device.deviceName ?? 'unknown',

    // The address of the device to connect to
    websocketAddress:
      device.webSocketDebuggerUrl +
      '&type=vscode' + // Adding the "classic" `type=vscode` query parameter (SDK <=49)
      `&userAgent=${encodeURIComponent(DEBUG_USER_AGENT)}`, // Adding the modern "userAgent" query parameter (SDK >=50)

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
  const bundlerPort = config.bundlerPort ?? '8081';

  const devices = await fetchDevicesToInspect({
    host: bundlerHost,
    port: bundlerPort,
  }).catch(() => {
    throw new Error(`waiting for bundler on ${bundlerHost}:${bundlerPort}...`);
  });

  if (devices.length === 1) {
    log('Picking only device available:', devices[0].deviceName);
    return devices[0];
  }

  if (devices.length > 1) {
    log('Asking user to pick device by name...');
    return await askDeviceByName(devices);
  }

  throw new Error('waiting for device to connect...');
}

/**
 * Resolve the "real path" of the project root.
 * This workaround is for Window's drive letter casing mismatch within the source maps.
 * VS Code seems to prefer lower case drive letters, while Metro use upper case drive letters.
 */
async function resolveWindowsProjectRoot(projectRoot: string) {
  if (process.platform !== 'win32') {
    return projectRoot;
  }

  return await new Promise<string>((resolve) => {
    fs.realpath.native(projectRoot, (error, realProjectRoot) => {
      if (error) {
        console.warn(
          `Failed to resolve the real path of the project root, this may break the breakpoints functionality.`
        );
        console.warn(`Reason: ${error.message} (${error.code})`);
        console.warn(
          `If you run into this issue often, please report it at: https://github.com/expo/vscode-expo/issues/new/choose`
        );
        resolve(projectRoot);
      } else {
        resolve(realProjectRoot);
      }
    });
  });
}
