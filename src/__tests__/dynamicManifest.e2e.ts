import { expect } from 'chai';
import vscode from 'vscode';

import {
  closeAllEditors,
  closeActiveEditor,
  findContentRange,
  getWorkspaceUri,
  replaceEditorContent,
  waitForActiveTabNameOpen,
} from './utils/vscode';
import { waitFor } from './utils/wait';
import { readWorkspaceFile } from '../utils/file';

describe('dynamic manifests', () => {
  ['app.config.js', 'app.config.ts'].forEach((manifestFile) => {
    describe(`manifest: ${manifestFile}`, () => {
      describe('asset completions', () => {
        let app: vscode.TextEditor;

        beforeEach(async () => {
          app = await vscode.window.showTextDocument(getWorkspaceUri('manifest', manifestFile));
        });

        afterEach(() => closeActiveEditor());

        it('suggests folders from project', async () => {
          const range = findContentRange(app, './assets/icon.png');
          await app.edit((builder) => builder.replace(range, './'));

          const suggestions = await vscode.commands.executeCommand<vscode.CompletionList>(
            'vscode.executeCompletionItemProvider',
            app.document.uri,
            range.start
          );

          expect(suggestions.items).to.have.length(2);
          expect(suggestions.items).to.containSubset([{ label: 'assets/' }, { label: 'plugins/' }]);
        });

        it('suggests image asset files from project', async () => {
          const range = findContentRange(app, './assets/icon.png');
          await app.edit((builder) => builder.replace(range, './assets/'));

          const suggestions = await vscode.commands.executeCommand<vscode.CompletionList>(
            'vscode.executeCompletionItemProvider',
            app.document.uri,
            range.start
          );

          expect(suggestions.items).to.have.length(4);
          expect(suggestions.items).to.containSubset([
            { label: 'adaptive-icon.png' },
            { label: 'favicon.png' },
            { label: 'icon.png' },
            { label: 'splash.png' },
          ]);
        });
      });

      describe('plugin completions', () => {
        let app: vscode.TextEditor;

        beforeEach(async () => {
          app = await vscode.window.showTextDocument(getWorkspaceUri('manifest', manifestFile));
        });

        afterEach(() => closeActiveEditor());

        it('suggests folders from local project', async () => {
          const range = findContentRange(app, './plugins/valid');
          await app.edit((builder) => builder.replace(range, './'));

          const suggestions = await vscode.commands.executeCommand<vscode.CompletionList>(
            'vscode.executeCompletionItemProvider',
            app.document.uri,
            range.start
          );

          expect(suggestions.items).to.containSubset([
            { label: 'assets/', command: { command: 'editor.action.triggerSuggest' } },
            { label: 'plugins/', command: { command: 'editor.action.triggerSuggest' } },
          ]);
        });

        it('suggests plugins from local project', async () => {
          const range = findContentRange(app, './plugins/valid');
          await app.edit((builder) => builder.replace(range, './plugins/'));

          const suggestions = await vscode.commands.executeCommand<vscode.CompletionList>(
            'vscode.executeCompletionItemProvider',
            app.document.uri,
            range.start
          );

          expect(suggestions.items).to.containSubset([{ label: 'valid.js' }]);
        });
      });

      describe('links', () => {
        let app: vscode.TextEditor;

        beforeEach(async () => {
          app = await vscode.window.showTextDocument(getWorkspaceUri('manifest', manifestFile));
        });

        afterEach(() => closeAllEditors());

        it('opens valid asset link', async () => {
          const links = await vscode.commands.executeCommand<vscode.DocumentLink[]>(
            'vscode.executeLinkProvider',
            app.document.uri
          );

          const range = findContentRange(app, './assets/icon.png');
          const link = links.find((item) => item.range.contains(range));

          await vscode.commands.executeCommand('vscode.open', link?.target);
          expect(await waitForActiveTabNameOpen('icon.png')).to.equal(true);
        });

        it('opens valid plugin from local file', async () => {
          const links = await vscode.commands.executeCommand<vscode.DocumentLink[]>(
            'vscode.executeLinkProvider',
            app.document.uri
          );

          const range = findContentRange(app, './plugins/valid');
          const link = links.find((item) => item.range.contains(range));

          await vscode.commands.executeCommand('vscode.open', link?.target);
          expect(await waitForActiveTabNameOpen('valid.js')).to.equal(true);
        });
      });

      describe('diagnostics', () => {
        let app: vscode.TextEditor;
        let content: string;

        before(async () => {
          content = await readWorkspaceFile(getWorkspaceUri('manifest', manifestFile));
        });

        beforeEach(async () => {
          app = await vscode.window.showTextDocument(getWorkspaceUri('manifest', manifestFile));
        });

        afterEach(() => replaceEditorContent(app, content));
        after(() => closeAllEditors());

        it('diagnoses non-existing asset file reference', async () => {
          const range = findContentRange(app, './assets/splash.png');
          await app.edit((builder) => builder.replace(range, './assets/doesnt-exist.png'));
          await waitFor(1000);

          const diagnostics = await vscode.languages.getDiagnostics(app.document.uri);
          expect(diagnostics).to.containSubset([
            {
              code: 'FILE_NOT_FOUND',
              message: 'File not found: ./assets/doesnt-exist.png',
              severity: vscode.DiagnosticSeverity.Warning,
            },
          ]);
        });

        it('diagnoses asset directory reference', async () => {
          const range = findContentRange(app, './assets/adaptive-icon.png');
          await app.edit((builder) => builder.replace(range, './assets'));
          await waitFor(1000);

          const diagnostics = await vscode.languages.getDiagnostics(app.document.uri);
          expect(diagnostics).to.containSubset([
            {
              code: 'FILE_IS_DIRECTORY',
              message: 'File is a directory: ./assets',
              severity: vscode.DiagnosticSeverity.Warning,
            },
          ]);
        });

        it('diagnoses non-existing local plugin definition', async () => {
          const range = findContentRange(app, './plugins/valid');
          await app.edit((builder) => builder.replace(range, './plugins/doesnt-exist'));
          await waitFor(1000);

          const diagnostics = await vscode.languages.getDiagnostics(app.document.uri);
          expect(diagnostics).to.containSubset([
            {
              code: 'PLUGIN_NOT_FOUND',
              message: 'Plugin not found: ./plugins/doesnt-exist',
              severity: vscode.DiagnosticSeverity.Warning,
            },
          ]);
        });

        it('diagnoses empty string plugin definition', async () => {
          const range = findContentRange(app, 'plugins: [');
          await app.edit((builder) => builder.replace(range, `plugins: ["",`));
          await waitFor(1000);

          const diagnostics = await vscode.languages.getDiagnostics(app.document.uri);
          expect(diagnostics).to.containSubset([
            {
              code: `PLUGIN_DEFINITION_INVALID`,
              message: 'Plugin definition is empty, expected a file or dependency name',
              severity: vscode.DiagnosticSeverity.Warning,
            },
          ]);
        });

        it('diagnoses empty array plugin definition', async () => {
          const range = findContentRange(app, 'plugins: [');
          await app.edit((builder) => builder.replace(range, `plugins: [[],`));
          await waitFor(1000);

          const diagnostics = await vscode.languages.getDiagnostics(app.document.uri);
          expect(diagnostics).to.containSubset([
            {
              code: `PLUGIN_DEFINITION_INVALID`,
              message: 'Plugin definition is empty, expected a file or dependency name',
              severity: vscode.DiagnosticSeverity.Warning,
            },
          ]);
        });
      });
    });
  });
});
