import { commands, window } from 'vscode';

import { PreviewCommand, PreviewModProvider } from '../../preview/setupPreview';
import {
  closeAllEditors,
  closeAllEditorsExcept,
  getWorkspaceUri,
  waitForEditorOpen,
} from '../utils/vscode';

describe(PreviewCommand.OpenExpoFileJsonPrebuild, () => {
  beforeEach(async () => {
    await window.showTextDocument(getWorkspaceUri('expo-app/app.json'));
  });

  afterEach(async () => {
    await closeAllEditorsExcept(getWorkspaceUri('expo-app/app.json'));
  });

  afterAll(async () => {
    await closeAllEditors();
  });

  it(`runs for ${PreviewModProvider.androidColors}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.androidColors
    );

    const preview = await waitForEditorOpen('colors.xml.json');
    const content = preview?.document.getText();

    expect(content).toMatchSnapshot();
    expect(content).toBeDefined();
  });

  it(`runs for ${PreviewModProvider.androidColorsNight}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.androidColorsNight
    );

    const preview = await waitForEditorOpen('colors.xml.json');
    const content = preview?.document.getText();

    expect(content).toMatchSnapshot();
    expect(content).toBeDefined();
  });

  it(`runs for ${PreviewModProvider.androidGradleProperties}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.androidGradleProperties
    );

    const preview = await waitForEditorOpen('gradle.properties.json');
    const content = preview?.document.getText();

    expect(content).toMatchSnapshot();
    expect(content).toBeDefined();
  });

  it(`runs for ${PreviewModProvider.androidManifest}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.androidManifest
    );

    const preview = await waitForEditorOpen('AndroidManifest.xml.json');
    const content = preview?.document.getText();

    expect(content).toMatchSnapshot();
    expect(content).toBeDefined();
  });

  it(`runs for ${PreviewModProvider.androidStrings}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.androidStrings
    );

    const preview = await waitForEditorOpen('strings.xml.json');
    const content = preview?.document.getText();

    expect(content).toMatchSnapshot();
    expect(content).toBeDefined();
  });

  it(`runs for ${PreviewModProvider.androidStyles}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.androidStyles
    );

    const preview = await waitForEditorOpen('styles.xml.json');
    const content = preview?.document.getText();

    expect(content).toMatchSnapshot();
    expect(content).toBeDefined();
  });

  it(`runs for ${PreviewModProvider.iosEntitlements}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.iosEntitlements
    );

    const preview = await waitForEditorOpen('Example.entitlements.json');
    const content = preview?.document.getText();

    expect(content).toMatchSnapshot();
    expect(content).toBeDefined();
  });

  it(`runs for ${PreviewModProvider.iosExpoPlist}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.iosExpoPlist
    );

    const preview = await waitForEditorOpen('Expo.plist.json');
    const content = preview?.document.getText();

    expect(content).toMatchSnapshot();
    expect(content).toBeDefined();
  });

  it(`runs for ${PreviewModProvider.iosInfoPlist}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.iosInfoPlist
    );

    const preview = await waitForEditorOpen('Info.plist.json');
    const content = preview?.document.getText();

    expect(content).toMatchSnapshot();
    expect(content).toBeDefined();
  });

  it(`runs for ${PreviewModProvider.iosPodfileProperties}`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.iosPodfileProperties
    );

    const preview = await waitForEditorOpen('Podfile.properties.json');
    const content = preview?.document.getText();

    expect(content).toMatchSnapshot();
    expect(content).toBeDefined();
  });
});
