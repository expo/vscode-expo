import assert from 'assert';
import http from 'http';
import { WebSocketServer } from 'ws';

import { type InspectableDevice } from '../../expo/bundler';

export type StubInspectorProxy = {
  server: http.Server;
  sockets: WebSocketServer;
};

/** Create and start a fake inspector proxy server */
export async function stubInspectorProxy() {
  const server = http.createServer();
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

      resolve({
        server,
        sockets,
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
  return `ws://localhost:${address.port}`;
}

export function mockDevice(
  properties: Partial<InspectableDevice> = {},
  server?: http.Server
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

  if (server) {
    device.webSocketDebuggerUrl =
      getServerAddress(server) + `/inspector/debug?device=${device.id}&page=1`;
  }

  return device;
}
