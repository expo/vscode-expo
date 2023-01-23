import fetch from 'node-fetch';
import path from 'path';
import { URL } from 'url';
import vscode from 'vscode';

const DEBUG_TYPE = 'expo';

interface ExpoDebugConfig extends vscode.DebugConfiguration {
  port: number;
  host: string;
}

export class ExpoDebuggersProvider implements vscode.DebugConfigurationProvider {
  constructor(extension: vscode.ExtensionContext) {
    extension.subscriptions.push(
      vscode.debug.registerDebugConfigurationProvider(
        DEBUG_TYPE,
        this,
        // I have no idea what this does, but why not, Expo is dynamic I think
        vscode.DebugConfigurationProviderTriggerKind.Dynamic
      )
    );
  }

  provideDebugConfigurations(folder?: vscode.WorkspaceFolder, token?: vscode.CancellationToken) {
    return [
      {
        type: DEBUG_TYPE,
        name: 'Attach to running Expo app',
        request: 'attach',
        port: 19000,
        host: 'localhost',
        projectRoot: '${workspaceFolder}',
      },
      {
        type: DEBUG_TYPE,
        name: 'Launch new Expo app',
        request: 'launch',
        port: 19000,
        host: 'localhost',
        projectRoot: '${workspaceFolder}',
      },
    ];
  }

  async resolveDebugConfiguration(
    folder: vscode.WorkspaceFolder | undefined,
    debugConfig: ExpoDebugConfig,
    token?: vscode.CancellationToken
  ) {
    // Pre-launch checks:
    //  - Is the `projectRoot` a valid Expo project?
    //  - Is the project SDK lower than 48? If so, warn that the debugger might not fully function
    //  - Is a compatible device connected?
    //    - If none, communicate to user and poll for new devices (also check for new incompatible devices and notify users)
    //    - If one, use it and continue
    //    - If multiple, find a way to describe devices and let the user choose
    //  - Finally, connect the debugger and wait for sourcemaps

    // Other things to consider:
    //  - Detect if monorepo, and Metro `serverRoot` is used properly (else sourcemaps won't work due to `../../` in urls)
    //  - Allow to start debugger by command instead of `launch.json` task
    //  - Check if we can add a `launch` debugger, that just starts Metro and runs everything from attach -> e.g. start separate terminal task that runs Metro
    //  - Try to auto-detect the expected port (19000 for classic managed, 8081 for dev clients)
    //  - Try to auto-detect the url vs hardcoding localhost

    // Let's eagerly abort stuff
    if (debugConfig.type !== DEBUG_TYPE) {
      throw new Error(`Unknown debug type: ${debugConfig.type}`);
    }
    if (debugConfig.request === 'launch') {
      throw new Error('Not implemented yet');
    }

    const metroHost = createMetroUrl(debugConfig);
    const sourceMapLocalRoot = path.join('${workspaceFolder}', debugConfig.projectRoot);
    const devices = await fetchMetroDevices(debugConfig);
    if (devices.length === 0) {
      throw new Error('Please connect a device running Hermes by loading your app');
    }

    const device = devices[0];

    /* Manual example
      {
        "type": "node",
        "request": "attach",
        "name": "Attach to Expo",
        "websocketAddress": "ws://[::1]:8081/inspector/debug?device=0&page=-1",
        "sourceMaps": true,
        "remoteRoot": "http://192.168.86.249:8081/",
        "localRoot": "${workspaceFolder}/apps/mobile",
        "sourceMapPathOverrides": {
          "http://192.168.86.249:8081/(.*).bundle": "${workspaceFolder}/apps/mobile/$1.(js|ts|tsx)"
        }
      }
    */
    const finalConfig = {
      type: 'pwa-node', // ofc... why use normal names?
      request: debugConfig.request,
      name: debugConfig.name,
      sourceMaps: true,
      localRoot: sourceMapLocalRoot,
      remoteRoot: metroHost,
      sourceMapPathOverrides: {
        [path.join(metroHost, '(.*).bundle')]: `${sourceMapLocalRoot}/$1.(jsx?|tsx?)`,
      },
      // pwa-node specific - https://github.com/microsoft/vscode-js-debug/blob/main/src/configuration.ts#L518
      websocketAddress: device.webSocketDebuggerUrl,
      attachExistingChildren: true,
      restart: true,
      pauseForSourceMap: true,
      rootPath: sourceMapLocalRoot,
      // pwa-chrome specific - https://github.com/microsoft/vscode-js-debug/blob/main/src/configuration.ts#L639
      // Note, this one doesn't seem to work
      // address: '192.168.92.226',
      // restart: true,
      // inspectUri: device.webSocketDebuggerUrl,
      // perScriptSourcemaps: 'no',
      // url: null,
    };

    console.log('EXPO DEBUG CONFIG', finalConfig);

    return finalConfig;
  }
}

/** @todo Find a lesser hacky hack */
function createMetroUrl(config: ExpoDebugConfig, path = '/') {
  const url = new URL(path, 'http://localhost');
  url.protocol = 'http';
  url.hostname = config.host || 'localhost';
  // url.port = String(config.port || '8081') || '8081';
  url.port = '8081';
  return url.toString();
}

/** @todo Reuse the logic from `@expo/dev-server` - would be great if we can have the device name through this list, to allow the user to select the right device */
interface MetroDevice {
  id: string;
  description: string;
  title: string;
  faviconUrl: string;
  devtoolsFrontendUrl: string;
  type: 'node';
  webSocketDebuggerUrl: string;
  vm: 'Hermes' | "don't use";
}

/** @todo Reuse the logic from `@expo/dev-server` */
async function fetchMetroDevices(config: ExpoDebugConfig) {
  const data = await fetch(createMetroUrl(config, '/json/list')).then((response) =>
    response.ok ? response.json() : Promise.reject(response)
  );

  return (data as MetroDevice[]).filter(
    (device) => device.title === 'React Native Experimental (Improved Chrome Reloads)'
  );
}
