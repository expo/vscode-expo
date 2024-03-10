import { expect } from 'chai';
import { match } from 'sinon';
import vscode from 'vscode';

import { mockDevice, stubInspectorProxy } from './utils/debugging';
import { disposedSpy, disposedStub } from './utils/sinon';
import { getWorkspaceUri } from './utils/vscode';

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
      await using proxy = await stubInspectorProxy();
      using upgrade = disposedSpy(proxy.sockets, 'handleUpgrade');
      const device = mockDevice({ deviceName: 'Fake target' }, proxy);

      // Return the devices when requested, without stubbing fetch.
      // Note, stubbing fetch doesn't work when testing production build as `node-fetch` gets bundled.
      proxy.app.callsFake((req, res) => {
        if (req.url === '/json/list') return res.end(JSON.stringify([device]));
        throw new Error('Invalid request: ' + req.url);
      });

      await vscode.debug.startDebugging(undefined, {
        type: 'expo',
        request: 'attach',
        name: 'Inspect Expo app',
        bundlerHost: proxy.serverUrl.hostname,
        bundlerPort: proxy.serverUrl.port,
        projectRoot: getWorkspaceUri('debugging').fsPath,
      });

      await vscode.commands.executeCommand('workbench.action.debug.stop');

      expect(proxy.app).to.be.called;
      expect(upgrade).to.be.called;

      // Ensure the debug URL is correct, it should look like:
      //   /inspector/debug?device=DEVICE_ID&page=PAGE_ID&userAgent=USER_AGENT
      const request = upgrade.getCall(1).args[0];
      expect(request.url).to.include('/inspector/debug');
      expect(request.url).to.include(`?device=${device.id}`);
      expect(request.url).to.include(`&page=`);
      expect(request.url).to.include(`&userAgent=vscode`);
    });

    it('starts debug session with user-picked device url', async () => {
      await using proxy = await stubInspectorProxy();
      using upgrade = disposedSpy(proxy.sockets, 'handleUpgrade');
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
        throw new Error('Invalid request: ' + req.url);
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

      await vscode.commands.executeCommand('workbench.action.debug.stop');

      expect(proxy.app).to.be.called;
      expect(upgrade).to.be.called;
      expect(quickPick).to.be.calledWith(
        match.array.deepEquals(['Another target', 'Fake target', 'Yet another target']),
        match({
          placeHolder: 'Select a device to debug',
        })
      );

      // Ensure the debug URL is correct, it should use the "Fake target" device ID
      const request = upgrade.getCall(1).args[0];
      expect(request.url).to.include('/inspector/debug');
      expect(request.url).to.include(`?device=the-one`);
    });
  });
});
