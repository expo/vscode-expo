import { expect } from 'chai';
import { match } from 'sinon';
import vscode from 'vscode';

import { mockDevice, stubInspectorProxy } from './utils/debugging';
import { disposedStub } from './utils/sinon';
import { getWorkspaceUri } from './utils/vscode';
import { waitForTrue } from './utils/wait';

describe('ExpoDebuggersProvider', () => {
  describe('command', () => {
    it('prompts for project root if no workspace is found', async () => {
      using input = disposedStub(vscode.window, 'showInputBox');
      await vscode.commands.executeCommand('expo.debug.start');
      expect(input).to.be.calledWith(match({ prompt: 'Enter the path to the Expo project' }));
    });

    it('fails when project root doesnt exist', async () => {
      using input = disposedStub(vscode.window, 'showInputBox');
      using error = disposedStub(vscode.window, 'showErrorMessage');

      input.returns(Promise.resolve('./'));
      await vscode.commands.executeCommand('expo.debug.start');

      expect(error).to.be.calledWith(match('Could not find any Expo projects in'));
    });

    it('aborts when no path was entered', async () => {
      using input = disposedStub(vscode.window, 'showInputBox');
      using debug = disposedStub(vscode.debug, 'startDebugging');

      input.returns(Promise.resolve(''));
      await vscode.commands.executeCommand('expo.debug.start');

      expect(debug).not.to.be.called;
    });

    it('starts debugging session when project is found', async () => {
      using input = disposedStub(vscode.window, 'showInputBox');
      using debug = disposedStub(vscode.debug, 'startDebugging');

      input.returns(Promise.resolve('./debugging'));
      await vscode.commands.executeCommand('expo.debug.start');

      expect(debug).to.be.calledWith(
        undefined,
        match({
          type: 'expo',
          request: 'attach',
          name: 'Inspect Expo app',
          projectRoot: getWorkspaceUri('debugging').fsPath,
        })
      );
    });
  });

  describe('debugger', () => {
    it('fails when using "type: launch"', async () => {
      const action = () =>
        vscode.debug.startDebugging(undefined, {
          type: 'expo',
          request: 'launch',
          name: 'Inspect Expo app',
          projectRoot: getWorkspaceUri('debugging').fsPath,
        });

      await expect(action()).to.eventually.rejected;
    });

    it('starts debug session with device url', async () => {
      await using proxy = await stubInspectorProxy(9000);
      const device = mockDevice({ deviceName: 'Fake target' }, proxy);

      // Return the devices when requested, without stubbing fetch.
      // Note, stubbing fetch doesn't work when testing production build as `node-fetch` gets bundled.
      proxy.app.callsFake((req, res) => {
        if (req.url === '/json/list') return res.end(JSON.stringify([device]));
        throw new Error('Unexpected request: ' + req.url);
      });

      await vscode.debug.startDebugging(undefined, {
        type: 'expo',
        request: 'attach',
        name: 'Inspect Expo app',
        bundlerHost: proxy.serverUrl.hostname,
        bundlerPort: proxy.serverUrl.port,
        projectRoot: getWorkspaceUri('debugging').fsPath,
      });

      await waitForTrue(() => proxy.websockets.length > 0);
      await vscode.commands.executeCommand('workbench.action.debug.stop');

      // Ensure `/json/list` was called
      expect(proxy.app).to.be.called;

      // Find the created websocket to `/inspector/debug`
      const instance = proxy.websockets.find(({ request }) => {
        console.log(request.url);
        return request.url?.startsWith('/inspector/debug');
      });
      // Ensure the debug URL is correct, it should look like:
      //   /inspector/debug?device=DEVICE_ID&page=PAGE_ID&userAgent=USER_AGENT
      expect(instance).not.to.be.undefined;
      expect(instance?.request.url).to.include(`?device=${device.id}`);
      expect(instance?.request.url).to.include(`&page=`);
      expect(instance?.request.url).to.include(`&userAgent=vscode`);
    });

    it('starts debug session with user-picked device url', async () => {
      await using proxy = await stubInspectorProxy(9100);
      using quickPick = disposedStub(vscode.window, 'showQuickPick');
      const devices = [
        mockDevice({ deviceName: 'Another target' }, proxy),
        mockDevice({ deviceName: 'Fake target', id: 'the-one' }, proxy),
        mockDevice({ deviceName: 'Yet another target' }, proxy),
      ];

      // Return the devices when requested, without stubbing fetch.
      // Note, stubbing fetch doesn't work when testing production build as `node-fetch` gets bundled.
      proxy.app.callsFake((req, res) => {
        if (req.url === '/json/list') return res.end(JSON.stringify(devices));
        throw new Error('Unexpected request: ' + req.url);
      });

      // @ts-expect-error - We are using string return values, not quickpick items
      quickPick.returns(Promise.resolve('Fake target'));

      await vscode.debug.startDebugging(undefined, {
        type: 'expo',
        request: 'attach',
        name: 'Inspect Expo app',
        bundlerHost: proxy.serverUrl.hostname,
        bundlerPort: proxy.serverUrl.port,
        projectRoot: getWorkspaceUri('debugging').fsPath,
      });

      await waitForTrue(() => proxy.websockets.length > 0);
      await vscode.commands.executeCommand('workbench.action.debug.stop');

      // Ensure `/json/list` was called
      expect(proxy.app).to.be.called;
      // Ensure quick pick was shown
      expect(quickPick).to.be.calledWith(
        match.array.deepEquals(['Another target', 'Fake target', 'Yet another target']),
        match({
          placeHolder: 'Select a device to debug',
        })
      );

      // Find the created websocket to `/inspector/debug`
      const instance = proxy.websockets.find(({ request }) =>
        request.url?.startsWith('/inspector/debug')
      );
      // Ensure the debug URL is correct, it should use the "Fake target" device ID
      expect(instance).not.to.be.undefined;
      expect(instance?.request.url).to.include(`?device=the-one`);
    });
  });
});
