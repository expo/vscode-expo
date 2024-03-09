import { expect } from 'chai';
import vscode from 'vscode';

import { ExpoConfigType, PreviewCommand } from '../../preview/constants';
import { sanitizeSnapshotValues } from '../utils/snapshot';
import { closeAllEditors, getWorkspaceUri, waitForEditorOpen } from '../utils/vscode';

describe(PreviewCommand.OpenExpoConfigPrebuild, () => {
  beforeEach(async () => {
    await vscode.window.showTextDocument(getWorkspaceUri('preview', 'app.json'));
  });

  afterEach(async () => {
    await closeAllEditors();
  });

  it(`runs for ${ExpoConfigType.INTROSPECT}`, async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoConfigPrebuild,
      ExpoConfigType.INTROSPECT
    );

    const preview = await waitForEditorOpen('_app.config.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${ExpoConfigType.PREBUILD}`, async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoConfigPrebuild,
      ExpoConfigType.PREBUILD
    );

    const preview = await waitForEditorOpen('_app.config.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });

  it(`runs for ${ExpoConfigType.PUBLIC}`, async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoConfigPrebuild,
      ExpoConfigType.PUBLIC
    );

    const preview = await waitForEditorOpen('exp.json');
    expect(preview).to.exist;

    const content = sanitizeSnapshotValues(preview!.document.getText());
    expect(content).toMatchSnapshot();
  });
});
