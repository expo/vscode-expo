import vscode from 'vscode';

import {
  ExpoDependencyDiagnosticProvider,
  ExpoDependencyFixProvider,
} from './diagnostics/package-dependency';

export function setupPackageDependencyDiagnostics(context: vscode.ExtensionContext) {
  new ExpoDependencyDiagnosticProvider().attach(context);

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      {
        scheme: 'file',
        // Match against app.json and app.config.json
        pattern: '**/*/package.json',
        language: 'json',
      },
      new ExpoDependencyFixProvider(),
      {
        providedCodeActionKinds: ExpoDependencyFixProvider.providedCodeActionKinds,
      }
    )
  );
}
