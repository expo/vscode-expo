import { findNodeAtLocation, findNodeAtOffset, getNodeValue } from 'jsonc-parser';
import path from 'path';
import vscode from 'vscode';

import { manifestPattern } from './expo/manifest';
import { PluginInfo, resolveInstalledPluginInfo, resolvePluginInfo } from './expo/plugin';
import { ExpoProject, ExpoProjectCache } from './expo/project';
import {
  getManifestFileReferencesExcludedFiles,
  isManifestFileReferencesEnabled,
} from './settings';
import { truthy } from './utils/array';
import { debug } from './utils/debug';
import { fileIsExcluded, fileIsHidden, getDirectoryPath } from './utils/file';
import { getDocumentRange, isKeyNode } from './utils/json';
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

    // Abort if we can't locate the current position within the manifest ast
    const positionNode = findPositionNode(project, document, position);
    if (!positionNode || isKeyNode(positionNode)) return null;

    // Abort if the current position is not within the `expo.plugins` area of the manifest
    const pluginsNode = findManifestPluginsNode(project);
    if (!pluginsNode || !getDocumentRange(document, pluginsNode).contains(position)) return null;

    // Fetch the basic information of the exact node the user is currently editing
    // This determines the type of autocompletion we can provide
    const positionValue = getNodeValue(positionNode);
    const positionIsPath = positionValue && positionValue.startsWith('./');

    // Create a list of installed Expo plugins when referencing a plugin by package name
    if (!positionIsPath && !token.isCancellationRequested) {
      return completePluginFromPackages(project, positionValue);
    }

    // Create a list of local Expo plugin files when referencing a plugin by path
    if (positionIsPath && !token.isCancellationRequested) {
      return completePluginOrFolderFromPath(project, positionValue, this.excludedFiles, token);
    }

    // Return no completion items if none can be found
    return null;
  }
}

/**
 * Find the app manifest JSON node for the current position within the document.
 * It describes the area the user is currently editing within the file.
 */
function findPositionNode(
  project: ExpoProject,
  document: vscode.TextDocument,
  position: vscode.Position
) {
  return findNodeAtOffset(project.manifest!.tree, document.offsetAt(position));
}

/**
 * Find the app manifest JSON node for the `expo.plugins` definition.
 * This contains all the plugin information provided by the user,
 * and is the area this completion provider focuses on.
 */
function findManifestPluginsNode(project: ExpoProject) {
  return findNodeAtLocation(project.manifest!.tree, ['plugins']);
}

/**
 * Create a list of installed Expo plugins when referencing a plugin by package name.
 * These autocompletions can be provided based on the user input:
 *   - `expo-` -> [expo-camera, expo-updates]
 *   - `expo-u` -> [expo-updates]
 */
function completePluginFromPackages(project: ExpoProject, userInput: string) {
  const infos = resolveInstalledPluginInfo(project, userInput, MAX_RESULT);
  const items = infos.map((plugin) => createPluginModuleItem(plugin));

  return new vscode.CompletionList(items);
}

/**
 * Create a list of local Expo plugin files when referencing a plugin by path.
 * These autocompletions can be provided based on the user input:
 *   - `./` -> [./folder, ./plugin.js]
 *   - `./folder/` -> [plugin.js] (nested inside ./folder)
 */
async function completePluginOrFolderFromPath(
  project: ExpoProject,
  userInput: string,
  excludedFiles: Record<string, boolean>,
  token: vscode.CancellationToken
) {
  // Find the directory we need to search for plugins
  const positionDir = getDirectoryPath(userInput) ?? '';
  // Find all entities within that directory, relative from project root
  const entities = await withCancelToken(token, () =>
    vscode.workspace.fs.readDirectory(vscode.Uri.file(path.join(project.root, positionDir)))
  );

  // Generate completion items for each entity
  return entities
    ?.map(([entityName, entityType]) => {
      // Skip hidden or excluded files
      if (fileIsHidden(entityName) || fileIsExcluded(entityName, excludedFiles)) {
        return null;
      }

      // This system does not look ahead inside the folder, so any folder should be a valid completion item
      if (entityType === vscode.FileType.Directory) {
        return createFolderItem(entityName);
      }

      // Limit the expensive plugin resolution to files with the `.js` extension only
      if (path.extname(entityName) === '.js') {
        // Try to resolve the plugin, if its a valid plugin file, create a completion item
        const pluginPath = './' + path.join(positionDir, entityName);
        const plugin = resolvePluginInfo(project.root, pluginPath);
        if (plugin) return createPluginFileItem(plugin, entityName);
      }
    })
    .filter(truthy);
}

function createPluginModuleItem(plugin: PluginInfo): vscode.CompletionItem {
  const item = new vscode.CompletionItem(plugin.pluginReference, vscode.CompletionItemKind.Module);

  // Sort app.plugin.js plugins higher since we can be sure that they have a valid plugin.
  item.sortText = `a_${plugin.isPluginFile ? 'a' : 'b'}_${plugin.pluginReference}`;

  // Add a detail text on the right of the suggestion that shows the filename.
  // This can be useful for packages which don't use `app.plugin.js`.
  item.detail = path.basename(plugin.pluginFile);

  return item;
}

function createPluginFileItem(plugin: PluginInfo, pluginFile: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(pluginFile, vscode.CompletionItemKind.File);

  // Sort app.plugin.js plugins higher since we can be sure that they have a valid plugin.
  item.sortText = `c_${plugin.isPluginFile ? 'c' : 'd'}_${plugin.pluginReference}`;

  return item;
}

/**
 * Create a new completion item for a folder.
 * Note, this adds a trailing `/` to the folder and triggers the next suggestion automatically.
 * While this makes it harder to type `./folder`, `./folder/` is a valid shorthand for `./folder/index.js`.
 */
function createFolderItem(folderPath: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(folderPath + '/', vscode.CompletionItemKind.Folder);

  item.sortText = `e_${path.basename(folderPath)}`;
  item.command = {
    title: '',
    command: 'editor.action.triggerSuggest',
  };

  return item;
}
