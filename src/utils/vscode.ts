import vscode from 'vscode';

import { debounce } from './debounce';
import { ExpoProjectCache } from '../expo/project';
import { manifestPattern } from '../expo/manifest';

/**
 * Perform an asynchronous task with an "improvised" canellation token.
 * When cancelled, the task is either not started or the results aren't result.
 */
export async function withCancelToken<T>(
  token: vscode.CancellationToken,
  action: (token: vscode.CancellationToken) => Thenable<T>
) {
  if (token.isCancellationRequested) return null;
  const result = await action(token);
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
    this.listenToEvents(subscriptions);
  }

  protected listenToEvents(subscriptions: vscode.Disposable[]) {
    // Listen to active editor changes that should trigger a new diagnosis
    subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => this.diagnose(editor?.document))
    );

    // Listen to save events that should trigger a new diagnosis
    subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((document) => this.diagnose(document))
    );

    // Listen to dirty documents of change events that should trigger a new diagnosis, after some delay
    subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((document) =>
        this.debouncedDiagnose(document.document)
      )
    );
  }

  public debouncedDiagnose = debounce(this.diagnose.bind(this));

  public async diagnose(document?: vscode.TextDocument) {
    this.debouncedDiagnose.cancel();

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

export abstract class ExpoCompletionsProvider implements vscode.CompletionItemProvider {
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

export abstract class ExpoTextDocumentContentProvider
  implements vscode.TextDocumentContentProvider
{
  protected _onDidChange = new vscode.EventEmitter<vscode.Uri>();

  constructor(
    { subscriptions }: vscode.ExtensionContext,
    protected projects: ExpoProjectCache,
    protected scheme: string
  ) {
    // Self-register the text document provider
    subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(scheme, this));

    // Register document change listeners
    subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        return this.onDidDocumentChangeDebounced(event.document);
      })
    );
    subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        return this.onDidDocumentChangeDebounced(event.document);
      })
    );
  }

  get onDidChange() {
    return this._onDidChange.event;
  }

  protected onDidDocumentChange(document: vscode.TextDocument) {
    if (vscode.languages.match(manifestPattern, document)) {
      console.log('FIRED DOCUMENT CHANGE FOR', document.uri.toString());
      this._onDidChange.fire(vscode.Uri.parse('expo-plugin-schema://schemas/plugin-schema.json'));
    }
  }

  protected onDidDocumentChangeDebounced = debounce(this.onDidDocumentChange.bind(this));

  abstract provideTextDocumentContent(
    uri: vscode.Uri,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<string>;
}
