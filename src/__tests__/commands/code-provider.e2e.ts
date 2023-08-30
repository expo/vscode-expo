import * as json from 'jsonc-parser';
import { commands, TextEditor, window } from 'vscode';

import { CodeProvider } from '../../preview/CodeProvider';
import { PreviewCommand, PreviewModProvider } from '../../preview/setupPreview';
import {
  closeAllEditors,
  getWorkspaceUri,
  replaceEditorContent,
  storeOriginalContent,
  waitForEditorOpen,
} from '../utils/vscode';
import { waitForFalse, waitForTrue } from '../utils/wait';

describe(CodeProvider, () => {
  let app: TextEditor;
  let restoreContent: ReturnType<typeof storeOriginalContent>;

  beforeAll(async () => {
    app = await window.showTextDocument(getWorkspaceUri('expo-app/app.json'));
    restoreContent = storeOriginalContent(app);
  });

  afterAll(async () => {
    await restoreContent();
    await closeAllEditors();
  });

  it('updates preview on added and removed content', async () => {
    await commands.executeCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      PreviewModProvider.androidManifest
    );

    const preview = await waitForEditorOpen('AndroidManifest.xml');
    const addition = json.modify(
      app.document.getText(),
      ['expo', 'android', 'permissions'],
      ['CAMERA'],
      { formattingOptions: { insertSpaces: true } }
    );

    await replaceEditorContent(app, json.applyEdits(app.document.getText(), addition));
    await app.document.save();

    const includesChange = await waitForTrue(
      () => preview?.document.getText().includes('android.permission.CAMERA')
    );

    expect(includesChange).toBe(true);

    const removal = json.modify(
      app.document.getText(),
      ['expo', 'android', 'permissions'],
      undefined,
      { formattingOptions: { insertSpaces: true } }
    );

    await replaceEditorContent(app, json.applyEdits(app.document.getText(), removal));
    await app.document.save();

    const excludesChange = await waitForFalse(
      () => preview?.document.getText().includes('android.permission.CAMERA')
    );

    expect(excludesChange).toBe(true);
  });
});
