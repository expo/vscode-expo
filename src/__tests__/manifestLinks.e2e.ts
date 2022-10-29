import { commands, DocumentLink, window } from 'vscode';

import { ManifestLinksProvider } from '../manifestLinks';
import {
  closeAllEditors,
  findContentRange,
  getWorkspaceUri,
  waitForActiveTabNameOpen,
} from './utils/vscode';

describe(ManifestLinksProvider, () => {
  // Based on: https://github.com/microsoft/vscode/blob/6cf68a1f23ee09d13e7e2bc4f7e8e2de1c5ef714/extensions/markdown-language-features/src/test/documentLink.test.ts#L171

  describe('assets', () => {
    afterEach(async () => {
      await closeAllEditors();
    });

    it('opens valid asset link', async () => {
      const app = await window.showTextDocument(getWorkspaceUri('manifest-links/app.json'));
      const links = await commands.executeCommand<DocumentLink[]>(
        'vscode.executeLinkProvider',
        app.document.uri
      );

      const range = findContentRange(app, './assets/icon.png');
      const link = links.find((link) => link.range.contains(range));

      await commands.executeCommand('vscode.open', link?.target);
      await expect(waitForActiveTabNameOpen('icon.png')).resolves.toBe(true);
    });
  });

  describe('plugins', () => {
    it('opens valid plugin from package', async () => {
      const app = await window.showTextDocument(getWorkspaceUri('manifest-links/app.json'));
      const links = await commands.executeCommand<DocumentLink[]>(
        'vscode.executeLinkProvider',
        app.document.uri
      );

      const range = findContentRange(app, 'expo-system-ui');
      const link = links.find((link) => link.range.contains(range));

      await commands.executeCommand('vscode.open', link?.target);
      await expect(waitForActiveTabNameOpen('app.plugin.js')).resolves.toBe(true);
    });

    it('opens valid plugin from package with options', async () => {
      const app = await window.showTextDocument(getWorkspaceUri('manifest-links/app.json'));
      const links = await commands.executeCommand<DocumentLink[]>(
        'vscode.executeLinkProvider',
        app.document.uri
      );

      const range = findContentRange(app, 'expo-camera');
      const link = links.find((link) => link.range.contains(range));

      await commands.executeCommand('vscode.open', link?.target);
      await expect(waitForActiveTabNameOpen('app.plugin.js')).resolves.toBe(true);
    });

    it('opens valid plugin from local file', async () => {
      const app = await window.showTextDocument(getWorkspaceUri('manifest-links/app.json'));
      const links = await commands.executeCommand<DocumentLink[]>(
        'vscode.executeLinkProvider',
        app.document.uri
      );

      const range = findContentRange(app, './plugins/valid');
      const link = links.find((link) => link.range.contains(range));

      await commands.executeCommand('vscode.open', link?.target);
      await expect(waitForActiveTabNameOpen('valid.js')).resolves.toBe(true);
    });
  });
});
