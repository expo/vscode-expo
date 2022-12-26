import { commands, CompletionList, window } from 'vscode';

import { closeAllEditors, findContentRange, getWorkspaceUri } from '../utils/vscode';
import { waitForTrue } from '../utils/wait';

describe('expo-module', () => {
  afterEach(async () => {
    await closeAllEditors();
  });

  it('provides autocomplete for expo-module.config.json `ios.debugOnly`', async () => {
    const app = await window.showTextDocument(
      getWorkspaceUri('expo-module/expo-module.config.json')
    );
    const range = findContentRange(app, 'debugOnly');

    await app.edit((builder) => builder.replace(range, 'debug'));

    await expect(
      // Retry the suggestions a couple of times, the schema might still need to be downloaded
      waitForTrue(async () => {
        const suggestions = await commands.executeCommand<CompletionList>(
          'vscode.executeCompletionItemProvider',
          app.document.uri,
          range.start
        );

        return suggestions.items.some((item) => item.label === 'debugOnly');
      })
    ).resolves.toBe(true);
  });
});
