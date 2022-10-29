import { findNodeAtLocation } from 'jsonc-parser';
import path from 'path';
import vscode from 'vscode';

import {
  FileReference,
  getFileReferences,
  getPluginDefinition,
  manifestPattern,
  resolvePluginFunction,
} from './expo/manifest';
import { ExpoProject, ExpoProjectCache } from './expo/project';
import { isManifestPluginValidationEnabled } from './settings';
import { debug } from './utils/debug';
import { getDocumentRange } from './utils/json';
import { ExpoDiagnosticsProvider } from './utils/vscode';

const log = debug.extend('manifest-diagnostics');

enum AssetIssueCode {
  notFound = 'FILE_NOT_FOUND',
  isDirectory = 'FILE_IS_DIRECTORY',
}

export class ManifestDiagnosticsProvider extends ExpoDiagnosticsProvider {
  private isEnabled = true;

  constructor(extension: vscode.ExtensionContext, projects: ExpoProjectCache) {
    super(extension, projects, manifestPattern, 'expo-manifest');
    this.isEnabled = isManifestPluginValidationEnabled();

    extension.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(() => {
        this.isEnabled = isManifestPluginValidationEnabled();
      })
    );
  }

  public async provideDiagnostics(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
    const issues: vscode.Diagnostic[] = [];

    if (!this.isEnabled) return issues;

    const project = this.projects.fromManifest(document);
    if (!project?.manifest) {
      log('Could not resolve project from manifest "%s"', document.fileName);
      return issues;
    }

    const plugins = findNodeAtLocation(project.manifest.tree, ['plugins']);
    const pluginsRange = plugins && getDocumentRange(document, plugins);

    for (const pluginNode of plugins?.children ?? []) {
      const { nameValue, nameRange } = getPluginDefinition(pluginNode);

      try {
        resolvePluginFunction(project.root, nameValue);
      } catch (error) {
        const issue = new vscode.Diagnostic(
          getDocumentRange(document, nameRange),
          error.message,
          vscode.DiagnosticSeverity.Error
        );

        if (error.code === 'PLUGIN_NOT_FOUND') {
          issue.message = `Plugin not found: ${nameValue}`;
        }

        issue.code = error.code;
        issues.push(issue);
      }
    }

    for (const reference of getFileReferences(project.manifest.content)) {
      const range = getDocumentRange(document, reference.fileRange);

      if (!pluginsRange?.contains(range)) {
        const issue = await diagnoseAsset(document, project, reference);
        if (issue) issues.push(issue);
      }
    }

    return issues;
  }
}

async function diagnoseAsset(
  document: vscode.TextDocument,
  project: ExpoProject,
  reference: FileReference
) {
  try {
    const uri = vscode.Uri.file(path.join(project.root, reference.filePath));
    const asset = await vscode.workspace.fs.stat(uri);

    if (asset.type === vscode.FileType.Directory) {
      const issue = new vscode.Diagnostic(
        getDocumentRange(document, reference.fileRange),
        `File is a directory: ${reference.filePath}`,
        vscode.DiagnosticSeverity.Warning
      );

      issue.code = AssetIssueCode.isDirectory;
      return issue;
    }
  } catch (error) {
    const issue = new vscode.Diagnostic(
      getDocumentRange(document, reference.fileRange),
      error.message,
      vscode.DiagnosticSeverity.Error
    );

    if (error.code === 'FileNotFound') {
      issue.message = `File not found: ${reference.filePath}`;
      issue.code = AssetIssueCode.notFound;
    }

    return issue;
  }
}
