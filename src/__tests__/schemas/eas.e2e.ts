import { commands, CompletionList, window } from 'vscode';

import { closeAllEditors, findContentRange, getWorkspaceUri } from '../utils/vscode';
import { waitForTrue } from '../utils/wait';

describe('eas', () => {
  afterEach(async () => {
    await closeAllEditors();
  });

  it('provides autocomplete for eas.json `build.development.developmentClient`', async () => {
    const app = await window.showTextDocument(getWorkspaceUri('eas-app/eas.json'));
    const range = findContentRange(app, 'developmentClient');

    await app.edit((builder) => builder.replace(range, 'developmentCl'));

    // Retry the suggestions a couple of times, the schema might still need to be downloaded
    const result = await waitForTrue(async () => {
      const suggestions = await commands.executeCommand<CompletionList>(
        'vscode.executeCompletionItemProvider',
        app.document.uri,
        range.start
      );

      return suggestions.items.some((item) => item.label === 'developmentClient');
    });

    expect(result).to.equal(true);
  });
});
