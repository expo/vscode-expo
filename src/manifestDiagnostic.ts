import { Node } from 'jsonc-parser';
import path from 'path';
import vscode, { DiagnosticSeverity } from 'vscode';

import {
  FileReferenceDefinition,
  findManifestFileReferences,
  findManifestPlugins,
  manifestFiles,
} from './expo/manifest';
import { getPluginDefinition, resolvePlugin } from './expo/plugin';
import { ExpoProject, ExpoProjectCache } from './expo/project';
import { coalesce } from './utils/array';
import { createDebug } from './utils/debug';
import { getDocumentRange } from './utils/json';
import { ExpoDiagnosticProvider } from './utils/vscode';

const log = createDebug('manifest-diagnostic');

enum FileIssue {
  notFound = 'FILE_NOT_FOUND',
  isDirectory = 'FILE_IS_DIRECTORY',
}

export class ManifestDiagnosticProvider extends ExpoDiagnosticProvider {
  constructor(context: vscode.ExtensionContext, projects: ExpoProjectCache) {
    super(context, projects, 'expo-config');

    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((document) => this.diagnose(document))
    );

    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document) {
          this.diagnose(editor.document);
        }
      })
    );
  }

  shouldDiagnose(document: vscode.TextDocument) {
    return (
      document.languageId.startsWith('json') &&
      manifestFiles.includes(path.basename(document.fileName))
    );
  }

  async diagnose(document: vscode.TextDocument) {
    if (!this.shouldDiagnose(document)) {
      return this.diagnostics.delete(document.uri);
    }

    const project = this.projects.fromManifest(document);
    if (!project || !project.manifest) {
      return log('No project manifest found for %s', document.fileName);
    }

    const issues: vscode.Diagnostic[] = [];
    const references = findManifestFileReferences(project.manifest);
    const plugins = findManifestPlugins(project.manifest);
    const pluginsRange = plugins && getDocumentRange(document, plugins);

    if (plugins && plugins.children) {
      const pluginsRange = getDocumentRange(document, plugins);

      issues.push(
        ...diagnosePlugins(document, project, plugins.children).filter(
          (issue) => !pluginsRange.contains(issue.range)
        )
      );
    }

    if (references.length) {
      await diagnoseAssets(document, project, references).then((assetIssues) =>
        issues.push(...assetIssues.filter((issue) => !pluginsRange?.contains(issue.range)))
      );
    }

    if (issues.length) {
      this.diagnostics.set(document.uri, issues);
    } else {
      this.diagnostics.delete(document.uri);
    }
  }
}

function diagnosePlugins(document: vscode.TextDocument, project: ExpoProject, plugins: Node[]) {
  const issues = [];

  for (const node of plugins) {
    const plugin = getPluginDefinition(node);

    try {
      resolvePlugin(project.root, plugin.nameValue);
    } catch (error) {
      const issue = new vscode.Diagnostic(
        getDocumentRange(document, plugin.nameRange),
        error.message,
        DiagnosticSeverity.Error
      );

      issue.code = error.code;
      issues.push(issue);
    }
  }

  return issues;
}

async function diagnoseAssets(
  document: vscode.TextDocument,
  project: ExpoProject,
  references: FileReferenceDefinition[]
) {
  const pending = references.map((reference) => {
    const uri = vscode.Uri.file(path.join(project.root, reference.filePath));

    return vscode.workspace.fs.stat(uri).then(
      (file) => {
        if (file.type === vscode.FileType.Directory) {
          const issue = new vscode.Diagnostic(
            getDocumentRange(document, reference.fileRange),
            `File is a directory: ${reference.filePath}`,
            vscode.DiagnosticSeverity.Warning
          );

          issue.code = FileIssue.isDirectory;
          return issue;
        }
      },
      (error) => {
        const issue = new vscode.Diagnostic(
          getDocumentRange(document, reference.fileRange),
          error.message,
          vscode.DiagnosticSeverity.Error
        );

        if (error.code === 'FileNotFound') {
          issue.message = `File not found: ${reference.filePath}`;
          issue.code = FileIssue.notFound;
        }

        return issue;
      }
    );
  });

  return Promise.all(pending).then(coalesce);
}
