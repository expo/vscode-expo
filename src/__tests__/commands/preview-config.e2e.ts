import { commands, window } from 'vscode';

import { ExpoConfigType } from '../../preview/ExpoConfigCodeProvider';
import { PreviewCommand } from '../../preview/setupPreview';
import {
  closeAllEditors,
  closeAllEditorsExcept,
  getWorkspaceUri,
  waitForEditorOpen,
} from '../utils/vscode';

describe(PreviewCommand.OpenExpoConfigPrebuild, () => {
  beforeEach(async () => {
    await window.showTextDocument(getWorkspaceUri('expo-app/app.json'));
  });

  afterEach(async () => {
    await closeAllEditorsExcept(getWorkspaceUri('expo-app/app.json'));
  });

  afterAll(async () => {
    await closeAllEditors();
  });

  it(`runs for ${ExpoConfigType.INTROSPECT}`, async () => {
    await commands.executeCommand(PreviewCommand.OpenExpoConfigPrebuild, ExpoConfigType.INTROSPECT);

    const preview = await waitForEditorOpen('_app.config.json');
    const content = preview?.document.getText();

    expect(content).toMatchSnapshot();
    expect(content).toBeDefined();
  });

  it(`runs for ${ExpoConfigType.PREBUILD}`, async () => {
    await commands.executeCommand(PreviewCommand.OpenExpoConfigPrebuild, ExpoConfigType.PREBUILD);

    const preview = await waitForEditorOpen('_app.config.json');
    const content = preview?.document.getText();

    expect(content).toMatchSnapshot();
    expect(content).toBeDefined();
  });

  it(`runs for ${ExpoConfigType.PUBLIC}`, async () => {
    await commands.executeCommand(PreviewCommand.OpenExpoConfigPrebuild, ExpoConfigType.PUBLIC);

    const preview = await waitForEditorOpen('exp.json');
    const content = preview?.document.getText();

    expect(content).toMatchSnapshot();
    expect(content).toBeDefined();
  });
});
