import { findNodeAtLocation, findNodeAtOffset, getNodeValue } from 'jsonc-parser';
import path from 'path';
import vscode from 'vscode';

import { manifestPattern } from './expo/manifest';
import { ExpoProjectCache } from './expo/project';
import {
  getManifestFileReferencesExcludedFiles,
  isManifestFileReferencesEnabled,
} from './settings';
import { truthy } from './utils/array';
import { debug } from './utils/debug';
import { fileIsExcluded, fileIsHidden, getDirectoryPath } from './utils/file';
import { getDocumentRange, isKeyNode } from './utils/json';
import { ExpoCompletionsProvider, withCancelToken } from './utils/vscode';

const log = debug.extend('manifest-asset-completions');

/** The allowed asset extensions to provide file completions for */
const ASSET_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];

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

    // Abort if the cursor is within the plugins section
    const plugins = findNodeAtLocation(project.manifest.tree, ['plugins']);
    if (plugins && getDocumentRange(document, plugins).contains(position)) return null;

    // Abort if the cursor is on a JSON key property
    const positionNode = findNodeAtOffset(project.manifest.tree, document.offsetAt(position));
    if (!positionNode || isKeyNode(positionNode)) return null;

    // Abort if the path is not relative, or if there is an extension already
    const positionValue = getNodeValue(positionNode);
    if (!positionValue || !positionValue.startsWith('.') || path.extname(positionValue)) {
      return null;
    }

    // Search entities within the user-provided directory
    const positionDir = getDirectoryPath(positionValue) ?? '';
    const entities = await withCancelToken(token, () =>
      vscode.workspace.fs.readDirectory(vscode.Uri.file(path.join(project.root, positionDir)))
    );

    return entities
      ?.map(([entityName, entityType]) => {
        if (fileIsHidden(entityName) || fileIsExcluded(entityName, this.excludedFiles)) {
          return null;
        }

        if (entityType === vscode.FileType.Directory) {
          return createFolder(entityName);
        }

        if (
          entityType === vscode.FileType.File &&
          ASSET_EXTENSIONS.includes(path.extname(entityName))
        ) {
          return createFile(entityName);
        }

        return null;
      })
      .filter(truthy);
  }
}

function createFile(filePath: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(filePath, vscode.CompletionItemKind.File);

  item.sortText = `d_${path.basename(filePath)}`;

  return item;
}

/**
 * Create a new completion item for a folder.
 * Note, this adds a trailing `/` to the folder and triggers the next suggestion automatically.
 * While this makes it harder to type `./folder`, `./folder/` is a valid shorthand for `./folder/index.js`.
 */
function createFolder(folderPath: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(folderPath + '/', vscode.CompletionItemKind.Folder);

  item.sortText = `d_${path.basename(folderPath)}`;
  item.command = {
    title: '',
    command: 'editor.action.triggerSuggest',
  };

  return item;
}
