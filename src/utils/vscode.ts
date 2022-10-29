import vscode, { DocumentSelector, ExtensionContext, languages } from 'vscode';

import { ExpoProjectCache } from '../expo/project';

export abstract class ExpoLinkProvider implements vscode.DocumentLinkProvider {
  constructor(
    { subscriptions }: ExtensionContext,
    protected projects: ExpoProjectCache,
    selector: DocumentSelector
  ) {
    subscriptions.push(languages.registerDocumentLinkProvider(selector, this));
  }

  abstract provideDocumentLinks(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentLink[]>;
}
