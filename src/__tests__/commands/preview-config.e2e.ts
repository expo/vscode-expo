import { commands, window } from 'vscode';

import { ExpoConfigType, PreviewCommand } from '../../preview/constants';
import { sanitizeSnapshotValues } from '../utils/snapshot';
import { closeAllEditors, getWorkspaceUri, waitForEditorOpen } from '../utils/vscode';

describe(PreviewCommand.OpenExpoConfigPrebuild, () => {
  beforeEach(async () => {
    await window.showTextDocument(getWorkspaceUri('preview/app.json'));
  });

  afterEach(async () => {
    await closeAllEditors();
  });

  it(`runs for ${ExpoConfigType.INTROSPECT}`, async () => {
    await commands.executeCommand(PreviewCommand.OpenExpoConfigPrebuild, ExpoConfigType.INTROSPECT);

    const preview = await waitForEditorOpen('_app.config.json');
    const content = sanitizeSnapshotValues(preview?.document.getText());

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${ExpoConfigType.PREBUILD}`, async () => {
    await commands.executeCommand(PreviewCommand.OpenExpoConfigPrebuild, ExpoConfigType.PREBUILD);

    const preview = await waitForEditorOpen('_app.config.json');
    const content = sanitizeSnapshotValues(preview?.document.getText());

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${ExpoConfigType.PUBLIC}`, async () => {
    await commands.executeCommand(PreviewCommand.OpenExpoConfigPrebuild, ExpoConfigType.PUBLIC);

    const preview = await waitForEditorOpen('exp.json');
    const content = sanitizeSnapshotValues(preview?.document.getText());

    expect(content).to.exist;
    expect(content).toMatchSnapshot();
  });
});
