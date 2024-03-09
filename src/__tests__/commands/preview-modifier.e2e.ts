import { expect } from 'chai';
import vscode from 'vscode';

import { PreviewCommand, PreviewModProvider } from '../../preview/constants';
import { sanitizeSnapshotValues } from '../utils/snapshot';
import { closeAllEditors, getWorkspaceUri, waitForEditorOpen } from '../utils/vscode';

describe(PreviewCommand.OpenExpoFilePrebuild, () => {
  beforeEach(async () => {
    await vscode.window.showTextDocument(getWorkspaceUri('preview', 'app.json'));
  });

  afterEach(async () => {
    await closeAllEditors();
  });

  it(`runs for ${PreviewModProvider.androidColors}`, async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidColors
    );

    const preview = await waitForEditorOpen('colors.xml');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidColorsNight}`, async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidColorsNight
    );

    const preview = await waitForEditorOpen('colors.xml');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidGradleProperties}`, async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidGradleProperties
    );

    const preview = await waitForEditorOpen('gradle.properties');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidManifest}`, async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidManifest
    );

    const preview = await waitForEditorOpen('AndroidManifest.xml');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidStrings}`, async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidStrings
    );

    const preview = await waitForEditorOpen('strings.xml');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidStyles}`, async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidStyles
    );

    const preview = await waitForEditorOpen('styles.xml');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.iosEntitlements}`, async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosEntitlements
    );

    const preview = await waitForEditorOpen('Example.entitlements');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.iosExpoPlist}`, async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosExpoPlist
    );

    const preview = await waitForEditorOpen('Expo.plist');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.iosInfoPlist}`, async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosInfoPlist
    );

    const preview = await waitForEditorOpen('Info.plist');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.iosPodfileProperties}`, async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosPodfileProperties
    );

    const preview = await waitForEditorOpen('Podfile.properties.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });
});

describe('dynamic configs', () => {
  afterEach(async () => {
    await closeAllEditors();
  });

  it(`runs ${PreviewModProvider.androidManifest} for app.json`, async () => {
    await vscode.window.showTextDocument(getWorkspaceUri('preview', 'app.json'));
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidManifest
    );

    const preview = await waitForEditorOpen('AndroidManifest.xml');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs ${PreviewModProvider.iosInfoPlist} for app.config.js`, async () => {
    await vscode.window.showTextDocument(getWorkspaceUri('preview-config-js', 'app.config.js'));
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosInfoPlist
    );

    const preview = await waitForEditorOpen('Info.plist');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs ${PreviewModProvider.androidManifest} for app.config.ts`, async () => {
    await vscode.window.showTextDocument(getWorkspaceUri('preview-config-ts', 'app.config.ts'));
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidManifest
    );

    const preview = await waitForEditorOpen('AndroidManifest.xml');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });
});
