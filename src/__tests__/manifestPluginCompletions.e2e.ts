import { commands, CompletionList, TextEditor, window } from 'vscode';

import { ManifestPluginCompletionsProvider } from '../manifestPluginCompletions';
import {
  closeAllEditors,
  findContentRange,
  getWorkspaceUri,
  storeOriginalContent,
} from './utils/vscode';

describe(ManifestPluginCompletionsProvider, () => {
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

  it('suggests plugins from installed packages', async () => {
    const range = findContentRange(app, 'expo-system-ui');
    await app.edit((builder) => builder.replace(range, ''));
    await app.document.save();

    const suggestions = await commands.executeCommand<CompletionList>(
      'vscode.executeCompletionItemProvider',
      app.document.uri,
      range.start
    );

    expect(suggestions.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'expo-camera' }),
        expect.objectContaining({ label: 'expo-system-ui' }),
      ])
    );
  });

  it('suggests folders from local project', async () => {
    const range = findContentRange(app, './plugins/valid');
    await app.edit((builder) => builder.replace(range, './'));
    await app.document.save();

    const suggestions = await commands.executeCommand<CompletionList>(
      'vscode.executeCompletionItemProvider',
      app.document.uri,
      range.start
    );

    expect(suggestions.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'assets' }),
        expect.objectContaining({ label: 'node_modules' }),
        expect.objectContaining({ label: 'plugins' }),
      ])
    );
  });

  it('suggests plugins from local project', async () => {
    const range = findContentRange(app, './plugins/valid');
    await app.edit((builder) => builder.replace(range, './plugins/'));
    await app.document.save();

    const suggestions = await commands.executeCommand<CompletionList>(
      'vscode.executeCompletionItemProvider',
      app.document.uri,
      range.start
    );

    expect(suggestions.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: 'valid.js' })])
    );
  });
});
