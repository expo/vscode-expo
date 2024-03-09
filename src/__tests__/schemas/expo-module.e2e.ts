import { expect } from 'chai';
import vscode from 'vscode';

import {
  closeAllEditors,
  findContentRange,
  getWorkspaceUri,
  storeOriginalContent,
} from '../utils/vscode';
import { waitForTrue } from '../utils/wait';

describe('expo-module', () => {
  let app: vscode.TextEditor;
  let restoreContent: ReturnType<typeof storeOriginalContent>;

  before(async () => {
    app = await vscode.window.showTextDocument(
      getWorkspaceUri('schema-expo-module', 'expo-module.config.json')
    );
    restoreContent = storeOriginalContent(app);
  });

  after(async () => {
    await restoreContent();
    await closeAllEditors();
  });

  it('provides autocomplete for expo-module.config.json `ios.debugOnly`', async () => {
    const range = findContentRange(app, 'debugOnly');

    await app.edit((builder) => builder.replace(range, 'debug'));

    // Retry the suggestions a couple of times, the schema might still need to be downloaded
    const result = await waitForTrue(async () => {
      const suggestions = await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider',
        app.document.uri,
        range.start
      );

      return suggestions.items.some((item) => item.label === 'debugOnly');
    });

    expect(result).to.equal(true);
  });
});
