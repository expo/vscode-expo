import vscode from 'vscode';

import { ExpoDependencyCache } from './expo/dependency';
import { packagePattern } from './expo/package';
import { ExpoProjectCache } from './expo/project';
import { isPackageVersionValidationEnabled } from './settings';
import { debug } from './utils/debug';
import { ExpoDiagnosticsProvider } from './utils/vscode';

const log = debug.extend('dependency-diagnostics');

export class DependencyDiagnosticsProvider extends ExpoDiagnosticsProvider {
  private isEnabled = false;
  private dependencies: ExpoDependencyCache;

  constructor(extension: vscode.ExtensionContext, projects: ExpoProjectCache) {
    super(extension, projects, packagePattern, 'expo-dependency');

    this.dependencies = new ExpoDependencyCache(extension);
    this.isEnabled = isPackageVersionValidationEnabled();

    extension.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(() => {
        this.isEnabled = isPackageVersionValidationEnabled();
      })
    );
  }

  public async provideDiagnostics(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
    const issues: vscode.Diagnostic[] = [];

    if (!this.isEnabled) return issues;

    const project = this.projects.fromPackage(document);
    const dependencies =
      project?.package && (await this.dependencies.fromPackage(project.package.tree));

    if (!dependencies) {
      log('Could not resolve versioned dependencies from package file "%s"', document.fileName);
      return issues;
    }
  }
}
