import path from 'path';
import semver from 'semver';
import vscode from 'vscode';

import { ThrottledDelayer } from '../../manifest/utils/async';
import { isDependenciesValidationEnabled } from '../../settings';
import { debug } from '../../utils/debug';
import { getProjectRoot } from '../../utils/getProjectRoot';
import { getDocumentRange } from '../../utils/jsonc';
import { getExpoSdkVersion, getVersionedDependencies } from '../utils/expoDependency';
import { getPackageDependencies, getPackageConfig } from '../utils/packageFile';

const log = debug.extend('dependencies');

export class ExpoDependencyDiagnosticProvider {
  private collection: vscode.DiagnosticCollection;
  private throttler: ThrottledDelayer<void>;

  constructor() {
    this.collection = vscode.languages.createDiagnosticCollection('expo-dependency');
    this.throttler = new ThrottledDelayer<void>(200);
  }

  attach(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((document) => this.diagnose(document))
    );

    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => this.diagnose(editor?.document))
    );

    context.subscriptions.push(
      vscode.workspace.onDidCloseTextDocument((document) => {
        this.collection.clear();
        this.throttler.cancel();
      })
    );

    if (vscode.window.activeTextEditor) {
      this.diagnose(vscode.window.activeTextEditor.document);
    }
  }

  shouldDiagnose(document: vscode.TextDocument) {
    return (
      isDependenciesValidationEnabled(document) &&
      path.basename(document.fileName) === 'package.json'
    );
  }

  diagnose(document?: vscode.TextDocument) {
    if (document && this.shouldDiagnose(document)) {
      log('Diagnosing %s', document.uri.toString());
      this.throttler.trigger(() => this.runDiagnose(document));
    } else {
      log('Diagnose not enabled');
      this.collection.clear();
      this.throttler.cancel();
    }
  }

  private async runDiagnose(document: vscode.TextDocument) {
    const projectRoot = getProjectRoot(document);
    const packageConfig = getPackageConfig(document.getText());
    if (!packageConfig) {
      return log('Diagnose aborted, package.json not resolved');
    }

    const expoVersion = await getExpoSdkVersion(projectRoot);
    if (!expoVersion) {
      return log('Diagnose aborted, expo version not resolved');
    }

    const expoDependencies = await getVersionedDependencies(projectRoot, expoVersion);
    const dependencies = packageConfig ? getPackageDependencies(packageConfig, 'dependencies') : [];
    const diagnostics: vscode.Diagnostic[] = [];

    for (const dependency of dependencies) {
      if (!(dependency.nameValue in expoDependencies)) {
        continue;
      }

      const actualRange = dependency.versionValue;
      const expectRange = expoDependencies[dependency.nameValue];
      const actualVersion = semver.minVersion(actualRange);

      if (actualVersion && !semver.satisfies(actualVersion, expectRange)) {
        const range = getDocumentRange(document, dependency.versionRange);
        const message = `Expo SDK ${expoVersion} uses ${dependency.nameValue} \`${expectRange}\``;
        const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning);

        diagnostic.relatedInformation = [
          new vscode.DiagnosticRelatedInformation(
            new vscode.Location(document.uri, range),
            `should be ${expectRange}`
          ),
        ];

        diagnostic.code = 'VERSION_MISMATCH';
        diagnostics.push(diagnostic);
      }
    }

    this.collection.set(document.uri, diagnostics);
  }
}

export class ExpoDependencyFixProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] {
    return context.diagnostics
      .filter((diagnostic) => diagnostic.code === 'VERSION_MISMATCH')
      .map((diagnostic) => this.createCommandCodeAction(document, diagnostic))
      .filter((action) => action !== null) as vscode.CodeAction[];
  }

  private createCommandCodeAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction | null {
    const expectedVersion = diagnostic.message.match(/`(.*)`/);
    if (!expectedVersion?.[1]) {
      return null;
    }

    const action = new vscode.CodeAction('Fix version', vscode.CodeActionKind.QuickFix);
    action.edit = new vscode.WorkspaceEdit();
    action.edit.replace(document.uri, diagnostic.range, expectedVersion?.[1]);
    action.diagnostics = [diagnostic];
    action.isPreferred = true;

    return action;
  }
}
