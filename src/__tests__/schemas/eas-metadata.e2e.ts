import { commands, CompletionList, window } from 'vscode';

import { closeAllEditors, findContentRange, getWorkspaceUri } from '../utils/vscode';
import { waitForTrue } from '../utils/wait';

describe('eas-metadata', () => {
  afterEach(async () => {
    await closeAllEditors();
  });

  it('provides autocomplete for store.config.json `apple.info.en-US.description`', async () => {
    const app = await window.showTextDocument(getWorkspaceUri('eas-app/store.config.json'));
    const range = findContentRange(app, 'description');

    await app.edit((builder) => builder.replace(range, 'descr'));

    await expect(
      // Retry the suggestions a couple of times, the schema might still need to be downloaded
      waitForTrue(async () => {
        const suggestions = await commands.executeCommand<CompletionList>(
          'vscode.executeCompletionItemProvider',
          app.document.uri,
          range.start
        );

        return suggestions.items.some((item) => item.label === 'description');
      })
    ).resolves.toBe(true);
  });
});
