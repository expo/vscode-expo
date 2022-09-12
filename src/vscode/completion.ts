import vscode from 'vscode';

export abstract class ExpoCompletionProvider implements vscode.CompletionItemProvider {
  constructor(
    context: vscode.ExtensionContext,
    selector: vscode.DocumentSelector,
    triggerCharacters: string[] = []
  ) {
    context.subscriptions.push(
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
