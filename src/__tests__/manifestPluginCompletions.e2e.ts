import { commands, CompletionList, TextEditor, window } from 'vscode';

import { closeActiveEditor, findContentRange, getWorkspaceUri } from './utils/vscode';

describe('ManifestPluginCompletionsProvider', () => {
  let app: TextEditor;

  beforeEach(async () => {
    app = await window.showTextDocument(getWorkspaceUri('manifest/app.json'));
  });

  afterEach(async () => {
    await closeActiveEditor();
  });

  it('suggests plugins from installed packages', async () => {
    const range = findContentRange(app, 'expo-system-ui');
    await app.edit((builder) => builder.replace(range, ''));

    const suggestions = await commands.executeCommand<CompletionList>(
      'vscode.executeCompletionItemProvider',
      app.document.uri,
      range.start
    );

    expect(suggestions.items).to.containSubset([
      { label: 'expo-camera' },
      { label: 'expo-system-ui' },
    ]);
  });

  it('suggests folders from local project', async () => {
    const range = findContentRange(app, './plugins/valid');
    await app.edit((builder) => builder.replace(range, './'));

    const suggestions = await commands.executeCommand<CompletionList>(
      'vscode.executeCompletionItemProvider',
      app.document.uri,
      range.start
    );

    expect(suggestions.items).to.containSubset([
      // `node_modules` are disabled by default in `src/settings.ts`
      { label: 'assets/', command: { command: 'editor.action.triggerSuggest' } },
      { label: 'plugins/', command: { command: 'editor.action.triggerSuggest' } },
    ]);
  });

  it('suggests plugins from local project', async () => {
    const range = findContentRange(app, './plugins/valid');
    await app.edit((builder) => builder.replace(range, './plugins/'));

    const suggestions = await commands.executeCommand<CompletionList>(
      'vscode.executeCompletionItemProvider',
      app.document.uri,
      range.start
    );

    expect(suggestions.items).to.containSubset([{ label: 'valid.js' }]);
  });
});
