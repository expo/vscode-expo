import vscode from 'vscode';

import { ExpoProjectCache } from '../expo/project';

// prettier-ignore
/**
 * The Expo diagnostic provider is a self-registering provider for diagnostic messages.
 * This provider can also access project information through the Expo project cache.
 */
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
