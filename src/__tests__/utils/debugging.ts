import assert from 'assert';
import http from 'http';
import { stub, type SinonStub } from 'sinon';
import { URL } from 'url';
import { WebSocketServer } from 'ws';

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
};

/** Create and start a fake inspector proxy server */
export async function stubInspectorProxy() {
  const app: StubInspectorProxy['app'] = stub();
  const server = http.createServer(app);
  const sockets = new WebSocketServer({ server });

  return new Promise<StubInspectorProxy & AsyncDisposable>((resolve, reject) => {
    server.once('error', reject);

    server.on('upgrade', (request, socket, head) => {
      sockets.handleUpgrade(request, socket, head, (ws) => {
        ws.on('error', console.error);
        sockets.emit('connection', ws);
      });
    });

    server.listen(() => {
      server.off('error', reject);

      const serverUrl = new URL(getServerAddress(server));

      resolve({
        app,
        sockets,
        server,
        serverUrl,
        async [Symbol.asyncDispose]() {
          await new Promise((resolve) => sockets.close(resolve));
          await new Promise((resolve) => server.close(resolve));
        },
      });
    });
  });
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
