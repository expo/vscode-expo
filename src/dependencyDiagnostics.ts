import vscode from 'vscode';

import { ExpoProjectCache } from './expo/project';
import { debug } from './utils/debug';
import { ExpoDiagnosticsProvider } from './utils/vscode';

const log = debug.extend('dependency-diagnostics');

const packagePattern: vscode.DocumentFilter = {
  scheme: 'file',
  pattern: '**/*/package.json',
};

enum DependencyISsueCode {
  //
}

export class DependencyDiagnosticsProvider extends ExpoDiagnosticsProvider {
  private isEnabled = true;

  constructor(extension: vscode.ExtensionContext, projects: ExpoProjectCache) {
    super(extension, projects, packagePattern, 'expo-dependency');
  }

  public async provideDiagnostics(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
    const issues: vscode.Diagnostic[] = [];

    if (!this.isEnabled) return issues;

    return issues;
  }
}

class DependencyFixProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    return [];
  }

  private createCommandCodeAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction | null {
    return null;
  }
}
