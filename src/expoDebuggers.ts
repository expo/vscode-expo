import vscode from 'vscode';

import { fetchDevicesToInspect, findDeviceByName, askDeviceByName } from './expo/bundler';
import { ExpoProjectCache, ExpoProject } from './expo/project';
import { debug } from './utils/debug';

const log = debug.extend('expo-debuggers');

const DEBUG_TYPE = 'expo';
const DEBUG_COMMAND = 'expo.debug.start';

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
      vscode.commands.registerCommand(DEBUG_COMMAND, (config?: ExpoDebugConfig) => {
        vscode.debug.startDebugging(undefined, {
          type: DEBUG_TYPE,
          request: 'attach',
          name: 'Debug Expo app',
          ...(config ?? {}),
        });
      })
    );
  }

  provideDebugConfigurations(folder?: vscode.WorkspaceFolder, token?: vscode.CancellationToken) {
    log('provideDebugConfigurations', 'called');
    return [
      {
        type: DEBUG_TYPE,
        request: 'attach',
        name: 'Inspect Expo app',
      },
    ];
  }

  async resolveDebugConfiguration(
    folder: vscode.WorkspaceFolder | undefined,
    config: ExpoDebugConfig,
    token?: vscode.CancellationToken
  ) {
    log('resolveDebugConfiguration', 'called');

    if (config.request === 'launch') {
      throw new Error(
        'Expo debugger does not support launch mode yet. Start the app manually, and connect through `attach`.'
      );
    }

    return {
      type: 'pwa-node',
      request: config.request,
      name: config.name,

      // Pass the user-provided configuration
      projectRoot: config.projectRoot,
      bundlerHost: config.bundlerHost,
      bundlerPort: config.bundlerPort,
      deviceName: config.deviceName,

      // Enable sourcemaps
      sourceMap: true,
      pauseForSourceMap: true,
      // But disable certain attempts to resolve non-existing source code
      resolveSourceMapLocations: ['!**/__prelude__', '!**/node_modules/**', '!webpack:/**'],

      // Attach to whatever processes is running in Hermes (not sure if required)
      attachExistingChildren: true,
      // When Hermes/app or the inspector unexpectedly disconnects, close the debug session
      restart: false,
      // Speed up the sourcemap loading, it's kind of experimental in `vscode-js-debug`, but does work fine eiher way
      enableTurboSourcemaps: true,
    };
  }

  async resolveDebugConfigurationWithSubstitutedVariables(
    folder: vscode.WorkspaceFolder | undefined,
    config: ExpoDebugConfig,
    token?: vscode.CancellationToken
  ) {
    const projectRoot = config.projectRoot ?? vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    // TODO(cedric): resolve this through the project cache instead
    const project = new ExpoProject(projectRoot, {} as any);

    const metroConfig = await resolveMetroConfig(config, project);

    log('resolveDebugConfigurationWithSubstitutedVariables', {
      ...config,
      ...metroConfig,
    });

    return { ...config, ...metroConfig };
  }
}

interface ExpoDebugConfig extends vscode.DebugConfiguration {
  projectRoot: string;
  bundlerHost?: string;
  bundlerPort?: string;
}

async function resolveMetroConfig(debugConfig: ExpoDebugConfig, project: ExpoProject) {
  const workflow = project.resolveWorkflow();

  const metroPort = debugConfig.bundlerPort ?? (workflow === 'generic' ? 8081 : 19000);
  const metroHost = debugConfig.bundlerHost ?? '127.0.0.1';
  const metroUrl = `http://${metroHost}:${metroPort}`;

  const device = await waitForMetroDevice(debugConfig, metroUrl);

  if (!device) {
    throw new Error('Expo debug cancelled.');
  }

  return {
    // The address of the device to connect to
    websocketAddress: device.webSocketDebuggerUrl,

    // Define the required root paths to resolve source maps
    localRoot: project.root,
    remoteRoot: metroUrl,
  };
}

async function waitForMetroDevice(debugConfig: ExpoDebugConfig, metroUrl: string) {
  return await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, cancellable: true, title: 'Expo debug' },
    async (progress, token) => {
      progress.report({ message: 'connecting to device...' });

      while (!token.isCancellationRequested) {
        try {
          return await resolveMetroDevice(debugConfig, metroUrl);
        } catch (error) {
          progress.report({ message: error.message });
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  );
}

async function resolveMetroDevice(config: ExpoDebugConfig, metroUrl: string) {
  const devices = await fetchDevicesToInspect(metroUrl).catch(() => {
    throw new Error('waiting for Metro bundler...');
  });

  if (devices.length === 1) {
    return devices[0];
  }

  if (devices.length > 1 && config.deviceName) {
    const device = findDeviceByName(devices, config.deviceName);
    if (device) return device;
  }

  if (devices.length > 1) {
    return await askDeviceByName(devices);
  }

  throw new Error('waiting for device to connect...');
}
