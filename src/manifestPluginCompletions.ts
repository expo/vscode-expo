import { findNodeAtLocation, findNodeAtOffset, getNodeValue } from 'jsonc-parser';
import path from 'path';
import vscode from 'vscode';

import { manifestPattern } from './expo/manifest';
import { PluginInfo, resolveInstalledPluginInfo, resolvePluginInfo } from './expo/plugin';
import { ExpoProjectCache } from './expo/project';
import {
  getManifestFileReferencesExcludedFiles,
  isManifestFileReferencesEnabled,
} from './settings';
import { truthy } from './utils/array';
import { debug } from './utils/debug';
import { fileIsExcluded, fileIsHidden, getDirectoryPath } from './utils/file';
import { getDocumentRange, isKeyNode } from './utils/json';
import { ExpoCompletionsProvider } from './utils/vscode';

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

    const positionNode = findNodeAtOffset(project.manifest.tree, document.offsetAt(position));
    if (!positionNode || isKeyNode(positionNode)) return null;

    const plugins = findNodeAtLocation(project.manifest.tree, ['plugins']);
    const positionInPlugins = plugins && getDocumentRange(document, plugins).contains(position);
    if (!positionInPlugins) return null;

    const positionValue = getNodeValue(positionNode);
    const positionIsPath = positionValue && positionValue.startsWith('./');

    if (!positionIsPath && !token.isCancellationRequested) {
      return createPossibleIncompleteList(
        resolveInstalledPluginInfo(project, positionValue, MAX_RESULT).map((plugin) =>
          createPluginModule(plugin)
        )
      );
    }

    if (positionIsPath && !token.isCancellationRequested) {
      const positionDir = getDirectoryPath(positionValue) ?? '';
      const entities = await vscode.workspace.fs.readDirectory(
        vscode.Uri.file(path.join(project.root, positionDir))
      );

      return entities
        .map(([entityName, entityType]) => {
          if (fileIsHidden(entityName) || fileIsExcluded(entityName, this.excludedFiles)) {
            return null;
          }

          if (entityType === vscode.FileType.Directory) {
            return createFolder(entityName);
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

function createPluginModule(plugin: PluginInfo): vscode.CompletionItem {
  const item = new vscode.CompletionItem(plugin.pluginReference, vscode.CompletionItemKind.Module);

  // Sort app.plugin.js plugins higher since we can be sure that they have a valid plugin.
  item.sortText = `a_${plugin.isPluginFile ? 'a' : 'b'}_${plugin.pluginReference}`;

  // Add a detail text on the right of the suggestion that shows the filename.
  // This can be useful for packages which don't use `app.plugin.js`.
  item.detail = path.basename(plugin.pluginFile);

  return item;
}

function createPluginFile(plugin: PluginInfo, pluginFile: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(pluginFile, vscode.CompletionItemKind.File);

  // Sort app.plugin.js plugins higher since we can be sure that they have a valid plugin.
  item.sortText = `c_${plugin.isPluginFile ? 'c' : 'd'}_${plugin.pluginReference}`;

  return item;
}

function createFolder(folderPath: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(folderPath, vscode.CompletionItemKind.Folder);

  item.sortText = `e_${path.basename(folderPath)}`;

  return item;
}
