import { commands, Selection, window } from 'vscode';

import { closeAllEditors, findContentRange, getWorkspaceUri } from '../utils/vscode';
import { waitFor, waitForTrue } from '../utils/wait';

describe('eas-metadata', () => {
  afterEach(async () => {
    await closeAllEditors();
  });

  it('provides autocomplete for store.config.json `apple.info.en-US.description`', async () => {
    const app = await window.showTextDocument(getWorkspaceUri('eas-app/store.config.json'));
    const range = findContentRange(app, 'description');

    app.selection = new Selection(range.start, range.end);
    await app.edit((builder) => builder.replace(range, 'descr'));

    await commands.executeCommand('editor.action.triggerSuggest');
    await waitFor(500);
    await commands.executeCommand('acceptSelectedSuggestion');

    await expect(waitForTrue(() => app.document.getText(range) === 'description')).resolves.toBe(
      true
    );
  });
});
