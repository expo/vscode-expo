import vscode from 'vscode';

import { ExpoProjectCache } from '../expo/project';

export abstract class ExpoLinkProvider implements vscode.DocumentLinkProvider {
  constructor(
    { subscriptions }: vscode.ExtensionContext,
    protected projects: ExpoProjectCache,
    selector: vscode.DocumentSelector
  ) {
    subscriptions.push(vscode.languages.registerDocumentLinkProvider(selector, this));
  }

  abstract provideDocumentLinks(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentLink[]>;
}

export abstract class ExpoDiagnosticsProvider {
  protected diagnostics: vscode.DiagnosticCollection;

  constructor(
    { subscriptions }: vscode.ExtensionContext,
    protected projects: ExpoProjectCache,
    private selector: vscode.DocumentSelector,
    diagnosticsName?: string
  ) {
    this.diagnostics = vscode.languages.createDiagnosticCollection(diagnosticsName);

    subscriptions.push(this.diagnostics);
    subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((document) => this.diagnose(document))
    );
    subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => this.diagnose(editor?.document))
    );
  }

  public async diagnose(document?: vscode.TextDocument) {
    if (document && vscode.languages.match(this.selector, document)) {
      this.diagnostics.set(document.uri, await this.provideDiagnostics(document));
    } else if (document) {
      this.diagnostics.delete(document.uri);
    }
  }

  public abstract provideDiagnostics(
    document: vscode.TextDocument
  ): vscode.Diagnostic[] | Promise<vscode.Diagnostic[]>;
}
