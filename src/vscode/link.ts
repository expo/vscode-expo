import vscode from 'vscode';

import { ExpoProjectCache } from '../expo/project';

/**
 * The Expo link provider is a self-registering provider for document links.
 * This provider can also access project information through the Expo project cache.
 */
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
