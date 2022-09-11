import vscode from 'vscode';

import { ExpoProjectCache } from '../expo/project';

// prettier-ignore
export abstract class MapCacheProvider<T> implements vscode.Disposable {
  protected cache: Map<string, T>;

  constructor(
    context: vscode.ExtensionContext,
    cache: Map<string, T> = new Map()
  ) {
    this.cache = cache;

    context.subscriptions.push(this);
  }

  dispose() {
    this.cache.clear();
  }
}

export abstract class ExpoLinkProvider implements vscode.DocumentLinkProvider {
  protected projects: ExpoProjectCache;

  constructor(
    context: vscode.ExtensionContext,
    projects: ExpoProjectCache,
    selector: vscode.DocumentSelector
  ) {
    this.projects = projects;

    context.subscriptions.push(vscode.languages.registerDocumentLinkProvider(selector, this));
  }

  abstract provideDocumentLinks(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentLink[]>;
}

// prettier-ignore
export abstract class ExpoDiagnosticProvider {
  protected diagnostics: vscode.DiagnosticCollection;
  protected projects: ExpoProjectCache;

  constructor(
    context: vscode.ExtensionContext,
    projects: ExpoProjectCache,
    name?: string
  ) {
    this.diagnostics = vscode.languages.createDiagnosticCollection(name);
    this.projects = projects;

    context.subscriptions.push(this.diagnostics);
  }

  /**
   * Check if the provider should diagnose the document.
   * This should be used as first check in the `diagnose` method.
   */
  abstract shouldDiagnose(document: vscode.TextDocument): boolean;

  abstract diagnose(document: vscode.TextDocument): void;
}
