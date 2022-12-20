import { findNodeAtLocation, findNodeAtOffset, getNodeValue } from 'jsonc-parser';
import path from 'path';
import vscode from 'vscode';

import { createFile, createFolder } from './expo/completion';
import { manifestPattern } from './expo/manifest';
import { ExpoProjectCache } from './expo/project';
import {
  getManifestFileReferencesExcludedFiles,
  isManifestFileReferencesEnabled,
} from './settings';
import { truthy } from './utils/array';
import { debug } from './utils/debug';
import { fileIsExcluded, fileIsHidden, getSearchDirectoryPath } from './utils/file';
import { getDocumentRange, getPropertyNode } from './utils/json';
import { ExpoCompletionsProvider, withCancelToken } from './utils/vscode';

const log = debug.extend('manifest-asset-completions');

export class ManifestAssetCompletionsProvider extends ExpoCompletionsProvider {
  private isEnabled = true;
  private excludedFiles: Record<string, boolean>;

  constructor(extension: vscode.ExtensionContext, projects: ExpoProjectCache) {
    super(extension, projects, manifestPattern, ['/']);

    this.isEnabled = isManifestFileReferencesEnabled();
    this.excludedFiles = getManifestFileReferencesExcludedFiles();

    extension.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        this.isEnabled = isManifestFileReferencesEnabled();
        this.excludedFiles = getManifestFileReferencesExcludedFiles();
      })
    );
  }

  public async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ) {
    if (!this.isEnabled) return null;

    const project = this.projects.fromManifest(document);
    if (!project?.manifest) {
      log('Could not resolve project from manifest "%s"', document.fileName);
      return [];
    }

    // Abort if the change is within the plugins section
    const plugins = findNodeAtLocation(project.manifest.tree, ['plugins']);
    if (plugins && getDocumentRange(document, plugins).contains(position)) {
      return null;
    }

    // Abort if we can't locate the change, or if it's a JSON key node
    const positionNode = findNodeAtOffset(project.manifest.tree, document.offsetAt(position));
    const propertyNode = positionNode && getPropertyNode(positionNode);
    if (!positionNode || propertyNode === positionNode) {
      return null;
    }

    // Abort if the path is not relative, or if there is an extension already
    const positionValue = getNodeValue(positionNode);
    if (!positionValue || !positionValue.startsWith('.') || path.extname(positionValue)) {
      return null;
    }

    // Search entities within the user-provided directory
    const positionDir = getSearchDirectoryPath(positionValue) ?? '';
    const entities = await withCancelToken(token, () =>
      vscode.workspace.fs.readDirectory(vscode.Uri.file(path.join(project.root, positionDir)))
    );

    return entities
      ?.map(([entityName, entityType]) => {
        if (fileIsHidden(entityName) || fileIsExcluded(entityName, this.excludedFiles)) {
          return null;
        }

        if (entityType === vscode.FileType.Directory) {
          return createFolder(entityName, positionValue);
        }

        return createFile(entityName);
      })
      .filter(truthy);
  }
}
