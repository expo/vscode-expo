import { DiagnosticSeverity, languages, TextEditor, window } from 'vscode';

import { ManifestDiagnosticsProvider } from '../manifestDiagnostics';
import { findContentRange, getWorkspaceUri, storeOriginalContent } from './utils/vscode';
import { waitFor } from './utils/wait';

describe(ManifestDiagnosticsProvider, () => {
  // Based on: https://github.com/microsoft/vscode-extension-samples/blob/fdd3bb95ce8e38ffe58fc9158797239fdf5017f1/lsp-sample/client/src/test/diagnostics.test.ts#L31

  let app: TextEditor;
  let restoreContent: ReturnType<typeof storeOriginalContent>;

  beforeAll(async () => {
    app = await window.showTextDocument(getWorkspaceUri('manifest-diagnostics/app.json'));
    restoreContent = storeOriginalContent(app);
  });

  afterEach(async () => {
    await restoreContent();
  });

  it('diagnoses non-existing asset file reference', async () => {
    const range = findContentRange(app, './assets/splash.png');
    await app.edit((builder) => builder.replace(range, './assets/doesnt-exist.png'));
    await app.document.save();

    await waitFor();
    const diagnostics = await languages.getDiagnostics(app.document.uri);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({
      code: 'FILE_NOT_FOUND',
      message: 'File not found: ./assets/doesnt-exist.png',
      severity: DiagnosticSeverity.Error,
    });
  });

  it('diagnoses asset directory reference', async () => {
    const range = findContentRange(app, './assets/adaptive-icon.png');
    await app.edit((builder) => builder.replace(range, './assets'));
    await app.document.save();

    await waitFor();
    const diagnostics = await languages.getDiagnostics(app.document.uri);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({
      code: 'FILE_IS_DIRECTORY',
      message: 'File is a directory: ./assets',
      severity: DiagnosticSeverity.Warning,
    });
  });

  it('diagnoses non-existing plugin reference', async () => {
    const range = findContentRange(app, '"plugins": ["expo-system-ui"]');
    await app.edit((builder) => builder.replace(range, '"plugins": ["doesnt-exists"]'));
    await app.document.save();

    await waitFor();
    const diagnostics = await languages.getDiagnostics(app.document.uri);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({
      code: 'PLUGIN_NOT_FOUND',
      message: 'Plugin not found: doesnt-exists',
      severity: DiagnosticSeverity.Error,
    });
  });
});
