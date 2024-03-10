import { findNodeAtLocation, Node } from 'jsonc-parser';
import vscode from 'vscode';

import { type FileReference, getFileReferences, manifestPattern } from './expo/manifest';
import { getPluginDefinition, resolvePluginFunctionUnsafe } from './expo/plugin';
import { ExpoProject, ExpoProjectCache } from './expo/project';
import {
  changedManifesPluginValidationEnabled,
  isManifestPluginValidationEnabled,
} from './settings';
import { debug } from './utils/debug';
import { getDocumentRange } from './utils/json';
import { resetModuleFrom } from './utils/module';
import { ExpoDiagnosticsProvider } from './utils/vscode';

const log = debug.extend('manifest-diagnostics');

enum AssetIssueCode {
  notFound = 'FILE_NOT_FOUND',
  isDirectory = 'FILE_IS_DIRECTORY',
}

enum PluginIssueCode {
  definitionInvalid = 'PLUGIN_DEFINITION_INVALID',
  functionInvalid = 'PLUGIN_FUNCTION_INVALID',
}

export class ManifestDiagnosticsProvider extends ExpoDiagnosticsProvider {
  private isEnabled = true;

  constructor(extension: vscode.ExtensionContext, projects: ExpoProjectCache) {
    super(extension, projects, manifestPattern, 'expo-manifest');
    this.isEnabled = isManifestPluginValidationEnabled();

    extension.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (changedManifesPluginValidationEnabled(event)) {
          this.isEnabled = isManifestPluginValidationEnabled();
        }
      })
    );
  }

  public async provideDiagnostics(document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
    const issues: vscode.Diagnostic[] = [];

    if (!this.isEnabled) return issues;

    const project = await this.projects.fromManifest(document);
    if (!project?.manifest) {
      log('Could not resolve project from manifest "%s"', document.fileName);
      return issues;
    }

    const plugins = findNodeAtLocation(project.manifest.tree, ['plugins']);
    const pluginsRange = plugins && getDocumentRange(document, plugins);

    // Diagnose each defined plugin, if any
    for (const pluginNode of plugins?.children ?? []) {
      const issue = diagnosePlugin(document, project, pluginNode);
      if (issue) issues.push(issue);
    }

    // Diagnose each defined asset, if any
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

function diagnosePlugin(document: vscode.TextDocument, project: ExpoProject, plugin: Node) {
  const { nameValue, nameRange } = getPluginDefinition(plugin);

  if ((plugin.children && plugin.children.length === 0) || !nameValue) {
    const issue = new vscode.Diagnostic(
      getDocumentRange(document, nameRange ?? plugin),
      `Plugin definition is empty, expected a file or dependency name`,
      vscode.DiagnosticSeverity.Warning
    );
    issue.code = PluginIssueCode.definitionInvalid;
    return issue;
  }

  try {
    resetModuleFrom(project.root.fsPath, nameValue);
    resolvePluginFunctionUnsafe(project.root.fsPath, nameValue);
  } catch (error) {
    const issue = new vscode.Diagnostic(
      getDocumentRange(document, nameRange),
      error.message,
      vscode.DiagnosticSeverity.Warning
    );

    issue.code = error.code;

    if (error.code === 'PLUGIN_NOT_FOUND') {
      issue.message = `Plugin not found: ${nameValue}`;
    }

    if (error.name === 'TypeError' && error.message?.includes(`null (reading 'default')`)) {
      issue.message = `Plugin exports null, expected a plugin function: ${nameValue}`;
      issue.code = PluginIssueCode.functionInvalid;
    }

    return issue;
  }
}

async function diagnoseAsset(
  document: vscode.TextDocument,
  project: ExpoProject,
  reference: FileReference
) {
  try {
    const uri = vscode.Uri.joinPath(project.root, reference.filePath);
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
      vscode.DiagnosticSeverity.Warning
    );

    if (error.code === 'FileNotFound') {
      issue.message = `File not found: ${reference.filePath}`;
      issue.code = AssetIssueCode.notFound;
    }

    return issue;
  }
}
