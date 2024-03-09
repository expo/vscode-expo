import { expect } from 'chai';
import vscode from 'vscode';

import {
  closeAllEditors,
  findContentRange,
  getWorkspaceUri,
  storeOriginalContent,
} from '../utils/vscode';
import { waitForTrue } from '../utils/wait';

describe('eas-metadata', () => {
  let app: vscode.TextEditor;
  let restoreContent: ReturnType<typeof storeOriginalContent>;

  before(async () => {
    app = await vscode.window.showTextDocument(getWorkspaceUri('schema-eas', 'store.config.json'));
    restoreContent = storeOriginalContent(app);
  });

  after(async () => {
    await restoreContent();
    await closeAllEditors();
  });

  it('provides autocomplete for store.config.json `apple.info.en-US.description`', async () => {
    const range = findContentRange(app, 'description');

    await app.edit((builder) => builder.replace(range, 'descr'));

    // Retry the suggestions a couple of times, the schema might still need to be downloaded
    const result = await waitForTrue(async () => {
      const suggestions = await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider',
        app.document.uri,
        range.start
      );

      return suggestions.items.some((item) => item.label === 'description');
    });

    expect(result).to.equal(true);
  });
});
