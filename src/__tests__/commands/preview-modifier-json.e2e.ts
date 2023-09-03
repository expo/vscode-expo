import { expect } from 'chai';
import { commands, window } from 'vscode';

import { PreviewCommand, PreviewModProvider } from '../../preview/constants';
import { sanitizeSnapshotValues } from '../utils/snapshot';
import { closeAllEditors, getWorkspaceUri, waitForEditorOpen } from '../utils/vscode';

describe(PreviewCommand.OpenExpoFileJsonPrebuild, () => {
  beforeEach(async () => {
    await window.showTextDocument(getWorkspaceUri('preview/app.json'));
  });

  afterEach(async () => {
    await closeAllEditors();
  });

  it(`runs for ${PreviewModProvider.androidColors} in json format`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.androidColors
    );

    const preview = await waitForEditorOpen('colors.xml.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidColorsNight} in json format`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.androidColorsNight
    );

    const preview = await waitForEditorOpen('colors.xml.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidGradleProperties} in json format`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.androidGradleProperties
    );

    const preview = await waitForEditorOpen('gradle.properties.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidManifest} in json format`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.androidManifest
    );

    const preview = await waitForEditorOpen('AndroidManifest.xml.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidStrings} in json format`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.androidStrings
    );

    const preview = await waitForEditorOpen('strings.xml.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.androidStyles} in json format`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.androidStyles
    );

    const preview = await waitForEditorOpen('styles.xml.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.iosEntitlements} in json format`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.iosEntitlements
    );

    const preview = await waitForEditorOpen('Example.entitlements.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.iosExpoPlist} in json format`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.iosExpoPlist
    );

    const preview = await waitForEditorOpen('Expo.plist.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.iosInfoPlist} in json format`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.iosInfoPlist
    );

    const preview = await waitForEditorOpen('Info.plist.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${PreviewModProvider.iosPodfileProperties} in json format`, async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      PreviewModProvider.iosPodfileProperties
    );

    const preview = await waitForEditorOpen('Podfile.properties.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });
});
