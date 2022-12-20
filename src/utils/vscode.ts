import vscode, { CompletionItemProvider } from 'vscode';

import { ExpoProjectCache } from '../expo/project';

/**
 * Perform an asynchronous task with an "improvised" canellation token.
 * When cancelled, the task is either not started or the results aren't result.
 */
export async function withCancelToken<T>(
  token: vscode.CancellationToken,
  action: () => Thenable<T>
): Promise<T | null> {
  if (token.isCancellationRequested) return null;
  const result = await action();
  return token.isCancellationRequested ? null : result;
}

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

export abstract class ExpoCompletionsProvider implements CompletionItemProvider {
  constructor(
    { subscriptions }: vscode.ExtensionContext,
    protected projects: ExpoProjectCache,
    selector: vscode.DocumentSelector,
    triggerCharacters: string[]
  ) {
    subscriptions.push(
      vscode.languages.registerCompletionItemProvider(selector, this, ...triggerCharacters)
    );
  }

  abstract provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>>;
}
