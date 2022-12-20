import { findNodeAtLocation, findNodeAtOffset, getNodeValue } from 'jsonc-parser';
import path from 'path';
import vscode from 'vscode';

import { createFolder, createPluginFile, createPluginModule } from './expo/completion';
import { manifestPattern } from './expo/manifest';
import { resolveInstalledPluginInfo, resolvePluginInfo } from './expo/plugin';
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

const log = debug.extend('manifest-plugin-completions');

/** The maximum amount of plugins or files to search for in advance (helps keeping things fast) */
const MAX_RESULT = 10;

export class ManifestPluginCompletionsProvider extends ExpoCompletionsProvider {
  private isEnabled = true;
  private excludedFiles: Record<string, boolean>;

  constructor(extension: vscode.ExtensionContext, projects: ExpoProjectCache) {
    super(extension, projects, manifestPattern, ['"', '/']);

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

    // Abort if the change is not within the plugins section
    const plugins = findNodeAtLocation(project.manifest.tree, ['plugins']);
    if (!plugins || !getDocumentRange(document, plugins).contains(position)) {
      return null;
    }

    // Abort if we can't locate the change, or if it's a JSON key node
    const positionNode = findNodeAtOffset(project.manifest.tree, document.offsetAt(position));
    const propertyNode = positionNode && getPropertyNode(positionNode);
    if (!positionNode || propertyNode === positionNode) {
      return null;
    }

    const positionValue = getNodeValue(positionNode);
    const positionIsPath = positionValue && positionValue.startsWith('.');

    // Resolve plugin suggestions from installed packages if the path is not relative
    if (!positionIsPath && !token.isCancellationRequested) {
      return createPossibleIncompleteList(
        resolveInstalledPluginInfo(project, positionValue, MAX_RESULT).map((plugin) =>
          createPluginModule(plugin, positionValue)
        )
      );
    }

    // Resolve plugin suggestions from the local project if the path is relative
    if (positionIsPath) {
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

          if (path.extname(entityName) === '.js') {
            const pluginPath = './' + path.join(positionDir, entityName);
            const plugin = resolvePluginInfo(project.root, pluginPath);
            if (plugin) {
              return createPluginFile(plugin, entityName);
            }
          }
        })
        .filter(truthy);
    }

    return null;
  }
}

function createPossibleIncompleteList(
  items: vscode.CompletionItem[],
  isIncomplete?: boolean
): vscode.CompletionList {
  return new vscode.CompletionList(
    items,
    isIncomplete !== undefined ? isIncomplete : items.length >= MAX_RESULT
  );
}
