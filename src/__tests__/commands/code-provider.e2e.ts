import { expect } from 'chai';
import * as jsonc from 'jsonc-parser';
import vscode from 'vscode';

import { PreviewCommand, PreviewModProvider } from '../../preview/constants';
import {
  closeAllEditors,
  getWorkspaceUri,
  replaceEditorContent,
  storeOriginalContent,
  waitForEditorOpen,
} from '../utils/vscode';
import { waitForFalse, waitForTrue } from '../utils/wait';

describe('CodeProvider', () => {
  let app: vscode.TextEditor;
  let restoreContent: ReturnType<typeof storeOriginalContent>;

  before(async () => {
    app = await vscode.window.showTextDocument(getWorkspaceUri('preview', 'app.json'));
    restoreContent = storeOriginalContent(app);
  });

  after(async () => {
    await restoreContent();
    await closeAllEditors();
  });

  it('updates preview on added and removed content', async () => {
    await vscode.commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidManifest
    );

    const preview = await waitForEditorOpen('AndroidManifest.xml');
    const addition = jsonc.modify(
      app.document.getText(),
      ['expo', 'updates', 'url'],
      'https://example.com/updates/url',
      { formattingOptions: { insertSpaces: true } }
    );

    const EXPECTED_UPDATES_URL =
      '<meta-data android:name="expo.modules.updates.EXPO_UPDATE_URL" android:value="https://example.com/updates/url"/>';

    await replaceEditorContent(app, jsonc.applyEdits(app.document.getText(), addition));
    await app.document.save();

    const includesChange = await waitForTrue(() =>
      preview?.document.getText().includes(EXPECTED_UPDATES_URL)
    );

    expect(includesChange).to.equal(true);

    const removal = jsonc.modify(app.document.getText(), ['expo', 'updates'], undefined, {
      formattingOptions: { insertSpaces: true },
    });

    await replaceEditorContent(app, jsonc.applyEdits(app.document.getText(), removal));
    await app.document.save();

    const excludesChange = await waitForFalse(() =>
      preview?.document.getText().includes(EXPECTED_UPDATES_URL)
    );

    expect(excludesChange).to.equal(true);
  });
});
