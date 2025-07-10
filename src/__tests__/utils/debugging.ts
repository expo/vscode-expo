import assert from 'assert';
import http from 'http';
import { stub, type SinonStub } from 'sinon';
import { URL } from 'url';
import { WebSocket, WebSocketServer } from 'ws';

import { type InspectableDevice } from '../../expo/bundler';

type StubInspectorProxyApp = http.RequestListener<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

export type StubInspectorProxy = {
  app: SinonStub<Parameters<StubInspectorProxyApp>, ReturnType<StubInspectorProxyApp>>;
  sockets: WebSocketServer;
  server: http.Server;
  serverUrl: URL;
  websockets: { request: http.IncomingMessage; socket: WebSocket }[];
};

/** Create and start a fake inspector proxy server */
export async function stubInspectorProxy(desiredPort?: number) {
  const app: StubInspectorProxy['app'] = stub();
  const server = http.createServer(app);
  const sockets = new WebSocketServer({ noServer: true, clientTracking: true });
  const { resolve, reject, promise } = promiseWithResolvers<StubInspectorProxy & AsyncDisposable>();
  const websockets: Set<StubInspectorProxy['websockets'][number]> = new Set();

  server.once('error', reject);

  server.on('upgrade', (request, socket, head) => {
    sockets.handleUpgrade(request, socket, head, (ws) => {
      ws.on('error', console.error);
      sockets.emit('connection', ws, request);
      websockets.add({ request, socket: ws });
    });
  });

  server.listen(0, () => {
    server.off('error', reject);
    resolve({
      app,
      sockets,
      server,
      serverUrl: new URL(getServerAddress(server)),
      get websockets() {
        return Array.from(websockets.values());
      },
      async [Symbol.asyncDispose]() {
        // Clean up the tracked sockets
        websockets.clear();
        // Terminate all existing socket connections
        sockets.clients.forEach((socket) => socket.terminate());
        // Close the socket server
        await new Promise((resolve) => sockets.close(resolve));
        // Close the server
        await new Promise((resolve) => server.close(resolve));
      },
    });
  });

  // Wait until the server is fully booted
  return await promise;
}

function getServerAddress(server: http.Server) {
  const address = server.address();
  assert(address && typeof address === 'object' && address.port, 'Server is not listening');
  return `http://localhost:${address.port}`;
}

export function mockDevice(
  properties: Partial<InspectableDevice> = {},
  proxy?: Pick<StubInspectorProxy, 'serverUrl'>
): InspectableDevice {
  const device: InspectableDevice = {
    id: 'device1',
    description: 'description1',
    title: 'React Native Experimental (Improved Chrome Reloads)', // Magic title, do not change
    faviconUrl: 'https://example.com/favicon.ico',
    devtoolsFrontendUrl: 'devtools://devtools/example',
    type: 'node',
    webSocketDebuggerUrl: 'ws://example.com',
    vm: 'hermes',
    deviceName: 'iPhone 15 Pro',
    ...properties,
  };

  if (proxy?.serverUrl) {
    const url = new URL(proxy.serverUrl.toString());

    url.protocol = 'ws:';
    url.pathname = '/inspector/debug';
    url.searchParams.set('device', device.id);
    url.searchParams.set('page', '1');

    device.webSocketDebuggerUrl = url.toString();
  }

  return device;
}

function promiseWithResolvers<T>(): {
  resolve: (value: T | Promise<T>) => any;
  reject: (error: Error) => any;
  promise: Promise<T>;
} {
  const context: any = {
    resolve: (value: T | Promise<T>) => {},
    reject: (error: Error) => {}, // eslint-disable-line node/handle-callback-err
    promise: undefined,
  };

  context.promise = new Promise<T>((resolve, reject) => {
    context.resolve = resolve;
    context.reject = reject;
  });

  return context;
}
