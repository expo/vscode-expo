import path from 'path';
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
      vscode.commands.registerCommand(DEBUG_COMMAND, (config?: ExpoDebugConfig) =>
        this.onDebugCommand(projects, config)
      )
    );
  }

  async onDebugCommand(projects: ExpoProjectCache, config?: ExpoDebugConfig) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? '';
    let relativePath = config?.projectRoot;
    let projectRoot = relativePath ? path.join(workspaceRoot, relativePath) : workspaceRoot;

    let project = projectRoot ? projects.maybeFromRoot(projectRoot) : undefined;

    if (!projectRoot || !projects.maybeFromRoot(projectRoot)) {
      relativePath = await vscode.window.showInputBox({
        title: 'Expo Debugger',
        prompt: 'Enter the path to the project root',
        value: './',
      });

      if (!relativePath) return;

      projectRoot = path.join(workspaceRoot, relativePath);
      project = projects.maybeFromRoot(projectRoot);
      if (!project) {
        return vscode.window.showErrorMessage(`Could not find the Expo project in: ${projectRoot}`);
      }
    }

    vscode.debug.startDebugging(undefined, {
      type: DEBUG_TYPE,
      request: 'attach',
      name: 'Inspect Expo app',
      projectRoot: relativePath ? path.join('${workspaceFolder}', relativePath) : undefined,
    });
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
      projectRoot: config.projectRoot ?? '${workspaceFolder}',
      bundlerHost: config.bundlerHost,
      bundlerPort: config.bundlerPort,
      trace: true,

      // Enable sourcemaps
      sourceMap: true,
      pauseForSourceMap: true,
      // Enable source-loading for `node_modules`, when using `expo/AppEntry.js`
      outFiles: [],
      // But disable certain attempts to resolve non-existing source code
      resolveSourceMapLocations: ['!**/__prelude__', '!webpack:**'],
      // Disable some internal webpack source-mapping, mostly for React DevTools Backend
      sourceMapPathOverrides: {},

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
    const project = this.projects.maybeFromRoot(config.projectRoot);
    if (!project) {
      throw new Error('Could not resolve Expo project: ' + config.projectRoot);
    }

    // Reuse the validated project root as cwd
    config.cwd = config.projectRoot;

    // Tell vscode how to resolve metro URLs locally
    // config.sourceMapPathOverrides['http:[\/]+[^\/]+\/(.+).bundle.*'] = `${config.projectRoot}/$1(.js|.jsx|.ts|.tsx|.css)`;
    // config.sourceMapPathOverrides['192.168.86.21:19000/App.bundle.*'] = `${config.projectRoot}/App.js`;

    // Infer the metro address from project workflow
    config.bundlerHost = config.bundlerHost ?? '127.0.0.1';
    config.bundlerPort =
      config.bundlerPort ?? (project.resolveWorkflow() === 'generic' ? '8081' : '19000');

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

async function resolveMetroConfig(config: ExpoDebugConfig, project: ExpoProject) {
  const device = await waitForMetroDevice(config);

  if (!device) {
    throw new Error('Expo debug cancelled.');
  }

  return {
    // The address of the device to connect to
    websocketAddress: device.webSocketDebuggerUrl,

    // Define the required root paths to resolve source maps
    localRoot: project.root,
    remoteRoot: `http://${config.bundlerHost}:${config.bundlerPort}`,
  };
}

async function waitForMetroDevice(config: ExpoDebugConfig) {
  return await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, cancellable: true, title: 'Expo debug' },
    async (progress, token) => {
      progress.report({ message: 'connecting to device...' });

      while (!token.isCancellationRequested) {
        try {
          return await resolveMetroDevice(config);
        } catch (error) {
          progress.report({ message: error.message });
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  );
}

async function resolveMetroDevice(config: ExpoDebugConfig) {
  const metroUrl = `http://${config.bundlerHost}:${config.bundlerPort}`;
  const devices = await fetchDevicesToInspect(metroUrl).catch(() => {
    throw new Error(`waiting for bundler on port ${config.bundlerPort}...`);
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
