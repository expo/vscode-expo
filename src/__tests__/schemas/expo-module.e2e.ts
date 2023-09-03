import { expect } from 'chai';
import { commands, CompletionList, TextEditor, window } from 'vscode';

import {
  closeAllEditors,
  findContentRange,
  getWorkspaceUri,
  storeOriginalContent,
} from '../utils/vscode';
import { waitForTrue } from '../utils/wait';

describe('expo-module', () => {
  let app: TextEditor;
  let restoreContent: ReturnType<typeof storeOriginalContent>;

  before(async () => {
    app = await window.showTextDocument(
      getWorkspaceUri('schema-expo-module/expo-module.config.json')
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
      const suggestions = await commands.executeCommand<CompletionList>(
        'vscode.executeCompletionItemProvider',
        app.document.uri,
        range.start
      );

      return suggestions.items.some((item) => item.label === 'debugOnly');
    });

    expect(result).to.equal(true);
  });
});
