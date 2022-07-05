import assert from 'assert';
import path from 'path';
import vscode from 'vscode';

import * as tools from '../../test/tools';
import { ExpoConfigType } from '../preview/ExpoConfigCodeProvider';
import { PreviewModProvider, PreviewCommand } from '../preview/setupPreview';

// note: the delay for the extension activation might take 5 seconds
jest.setTimeout(120 * 1000);

beforeAll(async () => {
  await tools.waitForExtensionActivation();
});

it(`is activated on startup`, async () => {
  expect(tools.getExtension().isActive).toBeTruthy();
});

describe('commands', () => {
  afterEach(async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
  });

  it(`runs ${PreviewCommand.OpenExpoConfigPrebuild} with ${ExpoConfigType.PREBUILD}`, async () => {
    await openWorkspaceFile('app.json');
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoConfigPrebuild,
      ExpoConfigType.PREBUILD
    );
    const editor = await waitForEditor('_app.config.json');
    expect(editor).not.toBeUndefined();
    expect(editor?.document.getText()).toContain('_internal');
  });

  it(`runs ${PreviewCommand.OpenExpoConfigPrebuild} with ${ExpoConfigType.PUBLIC}`, async () => {
    await openWorkspaceFile('app.json');
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoConfigPrebuild,
      ExpoConfigType.PUBLIC
    );
    const editor = await waitForEditor('exp.json');
    expect(editor).not.toBeUndefined();
    expect(editor?.document.getText()).toContain('originalFullName');
  });

  it(`runs ${PreviewCommand.OpenExpoConfigPrebuild} with ${ExpoConfigType.INTROSPECT}`, async () => {
    await openWorkspaceFile('app.json');
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoConfigPrebuild,
      ExpoConfigType.INTROSPECT
    );
    const editor = await waitForEditor('_app.config.json');
    expect(editor).not.toBeUndefined();
    expect(editor?.document.getText()).toContain('_internal');
  });

  it(`runs ${PreviewCommand.OpenExpoFilePrebuild} with ${PreviewModProvider.androidColors}`, async () => {
    await openWorkspaceFile('app.json');
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidColors
    );
    const editor = await waitForEditor('colors.xml');
    expect(editor).not.toBeUndefined();
    expect(editor?.document.getText()).not.toBeFalsy();
  });

  it(`runs ${PreviewCommand.OpenExpoFilePrebuild} with ${PreviewModProvider.androidColorsNight}`, async () => {
    await openWorkspaceFile('app.json');
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidColorsNight
    );
    const editor = await waitForEditor('colors.xml');
    expect(editor).not.toBeUndefined();
    expect(editor?.document.getText()).not.toBeFalsy();
  });

  it(`runs ${PreviewCommand.OpenExpoFilePrebuild} with ${PreviewModProvider.androidGradleProperties}`, async () => {
    await openWorkspaceFile('app.json');
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidGradleProperties
    );
    const editor = await waitForEditor('gradle.properties');
    expect(editor).not.toBeUndefined();
  });

  it(`runs ${PreviewCommand.OpenExpoFilePrebuild} with ${PreviewModProvider.androidManifest}`, async () => {
    await openWorkspaceFile('app.json');
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidManifest
    );
    const editor = await waitForEditor('AndroidManifest.xml');
    expect(editor).not.toBeUndefined();
    expect(editor?.document.getText()).not.toBeFalsy();
  });

  it(`runs ${PreviewCommand.OpenExpoFilePrebuild} with ${PreviewModProvider.androidStrings}`, async () => {
    await openWorkspaceFile('app.json');
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidStrings
    );
    const editor = await waitForEditor('strings.xml');
    expect(editor).not.toBeUndefined();
    expect(editor?.document.getText()).not.toBeFalsy();
  });

  it(`runs ${PreviewCommand.OpenExpoFilePrebuild} with ${PreviewModProvider.androidStyles}`, async () => {
    await openWorkspaceFile('app.json');
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidStyles
    );
    const editor = await waitForEditor('styles.xml');
    expect(editor).not.toBeUndefined();
    expect(editor?.document.getText()).not.toBeFalsy();
  });

  it(`runs ${PreviewCommand.OpenExpoFilePrebuild} with ${PreviewModProvider.iosEntitlements}`, async () => {
    await openWorkspaceFile('app.json');
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosEntitlements
    );
    const editor = await waitForEditor('Example.entitlements');
    expect(editor).not.toBeUndefined();
    expect(editor?.document.getText()).not.toBeFalsy();
  });

  it(`runs ${PreviewCommand.OpenExpoFilePrebuild} with ${PreviewModProvider.iosExpoPlist}`, async () => {
    await openWorkspaceFile('app.json');
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosExpoPlist
    );
    const editor = await waitForEditor('Expo.plist');
    expect(editor).not.toBeUndefined();
    expect(editor?.document.getText()).not.toBeFalsy();
  });

  it(`runs ${PreviewCommand.OpenExpoFilePrebuild} with ${PreviewModProvider.iosInfoPlist}`, async () => {
    await openWorkspaceFile('app.json');
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosInfoPlist
    );
    const editor = await waitForEditor('Info.plist');
    expect(editor).not.toBeUndefined();
    expect(editor?.document.getText()).not.toBeFalsy();
  });

  it(`runs ${PreviewCommand.OpenExpoFilePrebuild} with ${PreviewModProvider.iosPodfileProperties}`, async () => {
    await openWorkspaceFile('app.json');
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosPodfileProperties
    );
    const editor = await waitForEditor('Podfile.properties.json');
    expect(editor).not.toBeUndefined();
    expect(editor?.document.getText()).not.toBeFalsy();
  });
});

function getWorkspaceFile(fileName: string) {
  const workspace = vscode.workspace.workspaceFolders?.[0];
  assert(workspace !== undefined, 'Workspace folder not found');
  return vscode.Uri.file(path.join(workspace!.uri.fsPath, fileName));
}

function openWorkspaceFile(fileName: string) {
  return vscode.window
    .showTextDocument(getWorkspaceFile(fileName))
    .then((result) => new Promise((resolve) => setTimeout(() => resolve(result), 1000)));
}

async function waitForEditor(
  fileName: string,
  attempt = 0
): Promise<vscode.TextEditor | undefined> {
  const editor = vscode.window.visibleTextEditors.find(
    (e) => path.basename(e.document.fileName) === fileName
  );
  if (editor) {
    return editor;
  }
  if (attempt <= 10) {
    return waitFor(100).then(() => waitForEditor(fileName, attempt + 1));
  }
}

async function waitFor(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
