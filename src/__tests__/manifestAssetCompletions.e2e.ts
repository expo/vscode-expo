import { commands, CompletionList, TextEditor, window } from 'vscode';

import { ManifestAssetCompletionsProvider } from '../manifestAssetCompletions';
import {
  closeAllEditors,
  findContentRange,
  getWorkspaceUri,
  storeOriginalContent,
} from './utils/vscode';

describe(ManifestAssetCompletionsProvider, () => {
  let app: TextEditor;
  let restoreContent: ReturnType<typeof storeOriginalContent>;

  beforeAll(async () => {
    app = await window.showTextDocument(getWorkspaceUri('manifest-links/app.json'));
    restoreContent = storeOriginalContent(app);
  });

  afterEach(async () => {
    await restoreContent();
  });

  afterAll(async () => {
    await closeAllEditors();
  });

  it('suggests folders from project', async () => {
    const range = findContentRange(app, './assets/icon.png');
    await app.edit((builder) => builder.replace(range, './'));
    await app.document.save();

    const suggestions = await commands.executeCommand<CompletionList>(
      'vscode.executeCompletionItemProvider',
      app.document.uri,
      range.start
    );

    // Make sure only these two folders are suggested, it might trigger false positives
    expect(suggestions.items).toHaveLength(2);
    expect(suggestions.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'assets/' }),
        expect.objectContaining({ label: 'plugins/' }),
      ])
    );
  });

  it('suggests image asset files from project', async () => {
    const range = findContentRange(app, './assets/icon.png');
    await app.edit((builder) => builder.replace(range, './assets/'));
    await app.document.save();

    const suggestions = await commands.executeCommand<CompletionList>(
      'vscode.executeCompletionItemProvider',
      app.document.uri,
      range.start
    );

    // Make sure only these files are suggested, it might trigger false positives
    expect(suggestions.items).toHaveLength(4);
    expect(suggestions.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'adaptive-icon.png' }),
        expect.objectContaining({ label: 'favicon.png' }),
        expect.objectContaining({ label: 'icon.png' }),
        expect.objectContaining({ label: 'splash.png' }),
      ])
    );
  });

  it('does not suggest for non-asset key properties', async () => {
    const range = findContentRange(app, 'portrait');
    await app.edit((builder) => builder.replace(range, './'));
    await app.document.save();

    const suggestions = await commands.executeCommand<CompletionList>(
      'vscode.executeCompletionItemProvider',
      app.document.uri,
      range.start
    );

    expect(suggestions.items).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ label: 'assets/' })])
    );
  });
});
