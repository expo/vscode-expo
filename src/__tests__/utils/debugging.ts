import assert from 'assert';
import http from 'http';
import { WebSocketServer } from 'ws';

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

export function deviceWebSocketUrl(server: http.Server) {
  const address = server.address();
  assert(address && typeof address === 'object' && address.port, 'Server is not listening');
  return `ws://localhost:${address.port}`;
}
