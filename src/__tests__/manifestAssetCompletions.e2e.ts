import { expect } from 'chai';
import { commands, CompletionList, TextEditor, window } from 'vscode';

import { closeActiveEditor, findContentRange, getWorkspaceUri } from './utils/vscode';

describe('ManifestAssetCompletionsProvider', () => {
  // Test for both app.json and app.config.json formats
  ['app.json', 'app.config.json'].forEach((manifestFile) => {
    describe(`manifest: ${manifestFile}`, () => {
      let app: TextEditor;

      beforeEach(async () => {
        app = await window.showTextDocument(getWorkspaceUri(`manifest/${manifestFile}`));
      });

      afterEach(() => closeActiveEditor());

      it('suggests folders from project', async () => {
        const range = findContentRange(app, './assets/icon.png');
        await app.edit((builder) => builder.replace(range, './'));

        const suggestions = await commands.executeCommand<CompletionList>(
          'vscode.executeCompletionItemProvider',
          app.document.uri,
          range.start
        );

        // Make sure only these two folders are suggested, it might trigger false positives
        expect(suggestions.items).to.have.length(2);
        expect(suggestions.items).to.containSubset([{ label: 'assets/' }, { label: 'plugins/' }]);
      });

      it('suggests image asset files from project', async () => {
        const range = findContentRange(app, './assets/icon.png');
        await app.edit((builder) => builder.replace(range, './assets/'));

        const suggestions = await commands.executeCommand<CompletionList>(
          'vscode.executeCompletionItemProvider',
          app.document.uri,
          range.start
        );

        // Make sure only these files are suggested, it might trigger false positives
        expect(suggestions.items).to.have.length(4);
        expect(suggestions.items).to.containSubset([
          { label: 'adaptive-icon.png' },
          { label: 'favicon.png' },
          { label: 'icon.png' },
          { label: 'splash.png' },
        ]);
      });

      it('does not suggest for non-asset key properties', async () => {
        const range = findContentRange(app, 'portrait');
        await app.edit((builder) => builder.replace(range, './'));

        const suggestions = await commands.executeCommand<CompletionList>(
          'vscode.executeCompletionItemProvider',
          app.document.uri,
          range.start
        );

        expect(suggestions.items).to.not.include.deep.property('label', 'assets/');
      });
    });
  });
});
