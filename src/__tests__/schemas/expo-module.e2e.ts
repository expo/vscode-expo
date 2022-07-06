import { commands, Selection, window } from 'vscode';

import { closeAllEditors, findContentRange, getWorkspaceUri } from '../utils/vscode';
import { waitFor, waitForTrue } from '../utils/wait';

describe('expo-module', () => {
  afterEach(async () => {
    await closeAllEditors();
  });

  it('provides autocomplete for expo-module.config.json `ios.debugOnly`', async () => {
    const app = await window.showTextDocument(
      getWorkspaceUri('expo-module/expo-module.config.json')
    );

    const range = findContentRange(app, 'debugOnly');
    app.selection = new Selection(range.start, range.end);
    await app.edit((builder) => builder.replace(range, 'debug'));

    await commands.executeCommand('editor.action.triggerSuggest');
    await waitFor(500);
    await commands.executeCommand('acceptSelectedSuggestion');

    await expect(waitForTrue(() => app.document.getText(range) === 'debugOnly')).resolves.toBe(
      true
    );
  });
});
