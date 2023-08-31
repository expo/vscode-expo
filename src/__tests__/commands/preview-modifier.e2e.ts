import { commands, window } from 'vscode';

import { PreviewCommand, PreviewModProvider } from '../../preview/setupPreview';
import { closeAllEditors, getWorkspaceUri, waitForEditorOpen } from '../utils/vscode';

describe(PreviewCommand.OpenExpoFilePrebuild, () => {
  beforeEach(async () => {
    await window.showTextDocument(getWorkspaceUri('expo-app/app.json'));
  });

  afterEach(async () => {
    await closeAllEditors();
  });

  it(`runs for ${PreviewModProvider.androidColors}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidColors
    );

    const preview = await waitForEditorOpen('colors.xml');
    const content = preview?.document.getText();

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidColorsNight}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidColorsNight
    );

    const preview = await waitForEditorOpen('colors.xml');
    const content = preview?.document.getText();

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidGradleProperties}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidGradleProperties
    );

    const preview = await waitForEditorOpen('gradle.properties');
    const content = preview?.document.getText();

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidManifest}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidManifest
    );

    const preview = await waitForEditorOpen('AndroidManifest.xml');
    const content = preview?.document.getText();

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidStrings}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidStrings
    );

    const preview = await waitForEditorOpen('strings.xml');
    const content = preview?.document.getText();

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidStyles}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidStyles
    );

    const preview = await waitForEditorOpen('styles.xml');
    const content = preview?.document.getText();

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.iosEntitlements}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosEntitlements
    );

    const preview = await waitForEditorOpen('Example.entitlements');
    const content = preview?.document.getText();

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.iosExpoPlist}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosExpoPlist
    );

    const preview = await waitForEditorOpen('Expo.plist');
    const content = preview?.document.getText();

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.iosInfoPlist}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosInfoPlist
    );

    const preview = await waitForEditorOpen('Info.plist');
    const content = preview?.document.getText();

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.iosPodfileProperties}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosPodfileProperties
    );

    const preview = await waitForEditorOpen('Podfile.properties.json');
    const content = preview?.document.getText();

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });
});

describe('dynamic configs', () => {
  afterEach(async () => {
    await closeAllEditors();
  });

  it(`runs ${PreviewModProvider.androidManifest} for app.json`, async () => {
    await window.showTextDocument(getWorkspaceUri('expo-app/app.json'));
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidManifest
    );

    const preview = await waitForEditorOpen('AndroidManifest.xml');
    const content = preview?.document.getText();

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs ${PreviewModProvider.iosInfoPlist} for app.config.js`, async () => {
    await window.showTextDocument(getWorkspaceUri('config-js-app/app.config.js'));
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.iosInfoPlist
    );

    const preview = await waitForEditorOpen('Info.plist');
    const content = preview?.document.getText();

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs ${PreviewModProvider.androidManifest} for app.config.ts`, async () => {
    await window.showTextDocument(getWorkspaceUri('config-ts-app/app.config.ts'));
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidManifest
    );

    const preview = await waitForEditorOpen('AndroidManifest.xml');
    const content = preview?.document.getText();

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });
});
