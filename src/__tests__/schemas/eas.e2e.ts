import { commands, Selection, window } from 'vscode';

import { closeAllEditors, findContentRange, getWorkspaceUri } from '../utils/vscode';
import { waitFor, waitForTrue } from '../utils/wait';

describe('eas', () => {
  afterEach(async () => {
    await closeAllEditors();
  });

  it('provides autocomplete for eas.json `build.development.developmentClient`', async () => {
    const app = await window.showTextDocument(getWorkspaceUri('eas-app/eas.json'));
    const range = findContentRange(app, 'developmentClient');

    app.selection = new Selection(range.start, range.end);
    await app.edit((builder) => builder.replace(range, 'developmentCl'));

    await commands.executeCommand('editor.action.triggerSuggest');
    await waitFor(500);
    await commands.executeCommand('acceptSelectedSuggestion');

    await expect(
      waitForTrue(() => app.document.getText(range) === 'developmentClient')
    ).resolves.toBe(true);
  });
});
