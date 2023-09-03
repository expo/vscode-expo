import { expect } from 'chai';
import { commands, DocumentLink, TextEditor, window } from 'vscode';

import {
  closeAllEditors,
  findContentRange,
  getWorkspaceUri,
  waitForActiveTabNameOpen,
} from './utils/vscode';

describe('ManifestLinksProvider', () => {
  // Based on: https://github.com/microsoft/vscode/blob/6cf68a1f23ee09d13e7e2bc4f7e8e2de1c5ef714/extensions/markdown-language-features/src/test/documentLink.test.ts#L171

  // Test for both app.json and app.config.json formats
  ['app.json', 'app.config.json'].forEach((manifestFile) => {
    describe(`manifest: ${manifestFile}`, () => {
      let app: TextEditor;

      beforeEach(async () => {
        app = await window.showTextDocument(getWorkspaceUri(`manifest/${manifestFile}`));
      });

      afterEach(async () => {
        await closeAllEditors();
      });

      describe('assets', () => {
        it('opens valid asset link', async () => {
          const links = await commands.executeCommand<DocumentLink[]>(
            'vscode.executeLinkProvider',
            app.document.uri
          );

          const range = findContentRange(app, './assets/icon.png');
          const link = links.find((link) => link.range.contains(range));

          await commands.executeCommand('vscode.open', link?.target);
          expect(await waitForActiveTabNameOpen('icon.png')).to.equal(true);
        });
      });

      describe('plugins', () => {
        it('opens valid plugin from package', async () => {
          const links = await commands.executeCommand<DocumentLink[]>(
            'vscode.executeLinkProvider',
            app.document.uri
          );

          const range = findContentRange(app, 'expo-system-ui');
          const link = links.find((link) => link.range.contains(range));

          await commands.executeCommand('vscode.open', link?.target);
          expect(await waitForActiveTabNameOpen('app.plugin.js')).to.equal(true);
        });

        it('opens valid plugin from package with options', async () => {
          const links = await commands.executeCommand<DocumentLink[]>(
            'vscode.executeLinkProvider',
            app.document.uri
          );

          const range = findContentRange(app, 'expo-camera');
          const link = links.find((link) => link.range.contains(range));

          await commands.executeCommand('vscode.open', link?.target);
          expect(await waitForActiveTabNameOpen('app.plugin.js')).to.equal(true);
        });

        it('opens valid plugin from local file', async () => {
          const links = await commands.executeCommand<DocumentLink[]>(
            'vscode.executeLinkProvider',
            app.document.uri
          );

          const range = findContentRange(app, './plugins/valid');
          const link = links.find((link) => link.range.contains(range));

          await commands.executeCommand('vscode.open', link?.target);
          expect(await waitForActiveTabNameOpen('valid.js')).to.equal(true);
        });
      });
    });
  });
});
