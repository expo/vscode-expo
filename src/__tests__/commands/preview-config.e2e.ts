import { commands, window } from 'vscode';

import { ExpoConfigType } from '../../preview/ExpoConfigCodeProvider';
import { PreviewCommand } from '../../preview/setupPreview';
import { closeAllEditors, getWorkspaceUri, waitForEditorOpen } from '../utils/vscode';

describe(PreviewCommand.OpenExpoConfigPrebuild, () => {
  beforeEach(async () => {
    await window.showTextDocument(getWorkspaceUri('expo-app/app.json'));
  });

  afterEach(async () => {
    await closeAllEditors();
  });

  it(`runs for ${ExpoConfigType.INTROSPECT}`, async () => {
    await commands.executeCommand(PreviewCommand.OpenExpoConfigPrebuild, ExpoConfigType.INTROSPECT);

    const preview = await waitForEditorOpen('_app.config.json');
    const content = removeAbsolutePaths(preview?.document.getText());

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${ExpoConfigType.PREBUILD}`, async () => {
    await commands.executeCommand(PreviewCommand.OpenExpoConfigPrebuild, ExpoConfigType.PREBUILD);

    const preview = await waitForEditorOpen('_app.config.json');
    const content = removeAbsolutePaths(preview?.document.getText());

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${ExpoConfigType.PUBLIC}`, async () => {
    await commands.executeCommand(PreviewCommand.OpenExpoConfigPrebuild, ExpoConfigType.PUBLIC);

    const preview = await waitForEditorOpen('exp.json');
    const content = removeAbsolutePaths(preview?.document.getText());

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  /**
   * We can't store absolute paths in the snapshots, this kind-of takes care of that.
   * Else we would run into this issue quite a lot:
   *   - "packageJsonPath": "d:\\projects\\expo\\vscode-expo\\test\\fixture\\expo-app\\package.json",
   *   + "packageJsonPath": "/home/runner/work/vscode-expo/vscode-expo/test/fixture/expo-app/package.json",
   */
  function removeAbsolutePaths(content = '') {
    const absoluteProperties = [
      'projectRoot',
      'dynamicConfigPath',
      'staticConfigPath',
      'packageJsonPath',
    ];

    return content
      .split(/[\n\r?]/)
      .filter((line) => !absoluteProperties.some((property) => line.includes(property)));
  }
});
