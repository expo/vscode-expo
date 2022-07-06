import { commands, Selection, window } from 'vscode';

import { closeAllEditors, findContentRange, getWorkspaceUri } from '../utils/vscode';
import { waitFor, waitForTrue } from '../utils/wait';

describe('expo-xdl', () => {
  afterEach(async () => {
    await closeAllEditors();
  });

  it('provides autocomplete for app.json `expo.android`', async () => {
    const app = await window.showTextDocument(getWorkspaceUri('expo-app/app.json'));
    const range = findContentRange(app, 'android');

    app.selection = new Selection(range.start, range.end);
    await app.edit((builder) => builder.replace(range, 'andr'));

    await commands.executeCommand('editor.action.triggerSuggest');
    await waitFor(500);
    await commands.executeCommand('acceptSelectedSuggestion');

    await expect(waitForTrue(() => app.document.getText(range) === 'android')).resolves.toBe(true);
  });
});
