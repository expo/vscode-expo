import { expect } from 'chai';
import { match } from 'sinon';
import vscode from 'vscode';

import { disposedStub } from './utils/sinon';
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
});
