import { commands, CompletionList, window } from 'vscode';

import { closeAllEditors, findContentRange, getWorkspaceUri } from '../utils/vscode';
import { waitForTrue } from '../utils/wait';

describe('expo-xdl', () => {
  afterEach(async () => {
    await closeAllEditors();
  });

  it('provides autocomplete for app.json `expo.android`', async () => {
    const app = await window.showTextDocument(getWorkspaceUri('expo-app/app.json'));
    const range = findContentRange(app, 'android');

    await app.edit((builder) => builder.replace(range, 'andr'));

    // Retry the suggestions a couple of times, the schema might still need to be downloaded
    const result = await waitForTrue(async () => {
      const suggestions = await commands.executeCommand<CompletionList>(
        'vscode.executeCompletionItemProvider',
        app.document.uri,
        range.start
      );

      return suggestions.items.some((item) => item.label === 'android');
    });

    expect(result).to.equal(true);
  });
});
