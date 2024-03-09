import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import vscode from 'vscode';

import {
  closeAllEditors,
  findContentRange,
  getWorkspaceUri,
  replaceEditorContent,
} from './utils/vscode';
import { waitFor } from './utils/wait';
import { readWorkspaceFile } from '../utils/file';

describe('ManifestDiagnosticsProvider', () => {
  // Based on: https://github.com/microsoft/vscode-extension-samples/blob/fdd3bb95ce8e38ffe58fc9158797239fdf5017f1/lsp-sample/client/src/test/diagnostics.test.ts#L31

  // Test for both app.json and app.config.json formats
  ['app.json', 'app.config.json'].forEach((manifestFile) => {
    describe(`manifest: ${manifestFile}`, () => {
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

        expect(diagnostics).to.have.length(1);
        expect(diagnostics[0]).contain({
          code: 'FILE_NOT_FOUND',
          message: 'File not found: ./assets/doesnt-exist.png',
          severity: vscode.DiagnosticSeverity.Warning,
        });
      });

      it('diagnoses asset directory reference', async () => {
        const range = findContentRange(app, './assets/adaptive-icon.png');
        await app.edit((builder) => builder.replace(range, './assets'));
        await waitFor(1000);

        const diagnostics = await vscode.languages.getDiagnostics(app.document.uri);

        expect(diagnostics).to.have.length(1);
        expect(diagnostics[0]).contain({
          code: 'FILE_IS_DIRECTORY',
          message: 'File is a directory: ./assets',
          severity: vscode.DiagnosticSeverity.Warning,
        });
      });

      it('diagnoses non-existing plugin definition', async () => {
        const range = findContentRange(app, '"expo-system-ui",');
        await app.edit((builder) => builder.replace(range, '"doesnt-exists",'));
        await waitFor(1000);

        const diagnostics = await vscode.languages.getDiagnostics(app.document.uri);

        expect(diagnostics).to.have.length(1);
        expect(diagnostics[0]).contain({
          code: 'PLUGIN_NOT_FOUND',
          message: 'Plugin not found: doesnt-exists',
          severity: vscode.DiagnosticSeverity.Warning,
        });
      });

      it('diagnoses empty string plugin definition', async () => {
        const range = findContentRange(app, '"plugins": [');
        await app.edit((builder) => builder.replace(range, `"plugins": ["",`));
        await waitFor(1000);

        const diagnostics = await vscode.languages.getDiagnostics(app.document.uri);

        expect(diagnostics).to.have.length(1);
        expect(diagnostics[0]).contain({
          code: `PLUGIN_DEFINITION_INVALID`,
          message: 'Plugin definition is empty, expected a file or dependency name',
          severity: vscode.DiagnosticSeverity.Warning,
        });
      });

      it('diagnoses empty array plugin definition', async () => {
        const range = findContentRange(app, '"plugins": [');
        await app.edit((builder) => builder.replace(range, `"plugins": [[],`));
        await waitFor(1000);

        const diagnostics = await vscode.languages.getDiagnostics(app.document.uri);

        expect(diagnostics).to.have.length(1);
        expect(diagnostics[0]).contain({
          code: `PLUGIN_DEFINITION_INVALID`,
          message: 'Plugin definition is empty, expected a file or dependency name',
          severity: vscode.DiagnosticSeverity.Warning,
        });
      });

      it('re-diagnoses newly installed plugins', async () => {
        // Use different names to avoid IO issues
        const pluginName =
          manifestFile === 'app.json'
            ? '.expo/temporary-plugin.js'
            : '.expo/temporary-config-plugin.js';

        const pluginFile = getWorkspaceUri('manifest', pluginName).fsPath;

        // Force-remove the new plugin, to ensure it's not installed
        // Also use a gitignored folder to make sure its never committed
        fs.rmSync(pluginFile, { force: true });

        const preRange = findContentRange(app, '"expo-system-ui",');
        await app.edit((builder) => builder.replace(preRange, `"./${pluginName}",`));
        await waitFor(1000);

        const preInstallDiagnostic = await vscode.languages.getDiagnostics(app.document.uri);

        expect(preInstallDiagnostic).to.have.length(1);
        expect(preInstallDiagnostic[0]).contain({
          code: 'PLUGIN_NOT_FOUND',
          message: `Plugin not found: ./${pluginName}`,
          severity: vscode.DiagnosticSeverity.Warning,
        });

        // Create the new plugin file
        fs.mkdirSync(path.dirname(pluginFile), { recursive: true });
        fs.writeFileSync(
          pluginFile,
          'module.exports = function noopPlugin(config) { return config; };'
        );

        // Force an update in the manifest file, reset the existing diagnostics
        await app.edit((builder) =>
          builder.replace(findContentRange(app, `"./${pluginName}",`), `"./${pluginName}" ,`)
        );
        await waitFor(1000);

        const postInstallDiagnostic = await vscode.languages.getDiagnostics(app.document.uri);
        expect(postInstallDiagnostic).to.have.length(0);

        fs.rmSync(pluginFile, { force: true });
      });

      // Note, we don't test for plugin definitions with more than 2 array items.
      // That's handled by JSON Schema and out of scope for this test.
    });
  });
});
