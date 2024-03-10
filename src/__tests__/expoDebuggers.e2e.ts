import { expect } from 'chai';
import { match } from 'sinon';
import vscode from 'vscode';

import { mockDevice, stubInspectorProxy } from './utils/debugging';
import { stubFetch } from './utils/fetch';
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

    it('starts debug session with device websocket url', async () => {
      await using proxy = await stubInspectorProxy();
      using upgrade = disposedSpy(proxy.sockets, 'handleUpgrade');

      const device = mockDevice({ deviceName: 'Fake inspection target' }, proxy.server);
      using fetch = stubFetch([device]);

      await vscode.debug.startDebugging(undefined, {
        type: 'expo',
        request: 'attach',
        name: 'Inspect Expo app',
        bundlerHost: 'localhost',
        projectRoot: getWorkspaceUri('debugging').fsPath,
      });

      await vscode.commands.executeCommand('workbench.action.debug.stop');

      expect(fetch).to.be.calledWith('http://localhost:8081/json/list');
      expect(upgrade).to.be.called;

      // Ensure the debug URL is correct, it should look like:
      //   /inspector/debug?device=DEVICE_ID&page=PAGE_ID&userAgent=USER_AGENT
      const request = upgrade.getCall(1).args[0];
      expect(request.url).to.include('/inspector/debug');
      expect(request.url).to.include(`?device=${device.id}`);
      expect(request.url).to.include(`&page=`);
      expect(request.url).to.include(`&userAgent=vscode`);
    });
  });
});
