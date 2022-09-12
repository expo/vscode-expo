import { findNodeAtOffset, getNodeValue } from 'jsonc-parser';
import path from 'path';
import vscode from 'vscode';

import { findManifestPlugins, isManifestPropertyImage, manifestPattern } from './expo/manifest';
import {
  getDefinedPlugins,
  PluginInfo,
  resolvePackagePluginsInfo,
  resolvePluginInfo,
} from './expo/plugin';
import { ExpoProjectCache } from './expo/project';
import { createDebug } from './utils/debug';
import { fileIsHidden } from './utils/file';
import {
  findPropertyNode,
  getDocumentRange,
  getNodeValueRange,
  isPropertyNode,
} from './utils/json';
import { ExpoCompletionProvider } from './vscode/completion';

const log = createDebug('manifest-completion');

// TODO: add caching for folders read?
// TODO: add caching for resolved plugins?
export class ManifestCompletionProivder extends ExpoCompletionProvider {
  constructor(context: vscode.ExtensionContext, private projects: ExpoProjectCache) {
    super(context, manifestPattern, ['"', '.', '/', path.sep]);
  }

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ) {
    const project = this.projects.fromManifest(document);
    if (!project || !project.manifest) {
      return log('File is not an Expo manifest: %s', document.uri.fsPath);
    }

    const inputNode = findNodeAtOffset(project.manifest.tree, document.offsetAt(position));
    if (!inputNode) {
      return log('No JSON node found at document position: %s', document.offsetAt(position));
    }

    if (isPropertyNode(inputNode) || inputNode.type !== 'string') {
      return log('Current JSON node is not a string: %s', inputNode.type);
    }

    const plugins = findManifestPlugins(project.manifest);
    const pluginsDefinition = getDefinedPlugins(plugins);
    const inputWithinPlugins = plugins && getDocumentRange(document, plugins).contains(position);

    const inputValue = getNodeValue(inputNode) as string;
    const inputIsPath = !!inputValue && /^(\/|\.)/.test(inputValue);
    const inputRange = getDocumentRange(document, getNodeValueRange(inputNode));

    if (token.isCancellationRequested) return null;

    if (inputWithinPlugins && !inputIsPath) {
      return resolvePackagePluginsInfo(project)
        .filter((info) => !pluginsDefinition.has(info.pluginReference))
        .map((info) => createPluginModule(info, inputRange));
    }

    if (inputWithinPlugins && inputIsPath) {
      const searchPath = path.join(project.root, inputValue);
      const searchEntries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(searchPath));

      // This completion get's triggered after either `.` or `./`.
      // We need to move the start position to the end of the input value.
      const insertRange = inputRange.with(position);

      return searchEntries
        .filter(([name]) => !fileIsHidden(name) && name !== 'node_modules')
        .filter(([name, type]) => {
          if (type === vscode.FileType.Directory) return true;

          const pluginReference = './' + path.join(inputValue, name);
          if (pluginsDefinition.has(pluginReference.replaceAll('\\', '/'))) {
            return false;
          }

          return !!resolvePluginInfo(project.root, pluginReference);
        })
        .map(([name, type]) =>
          type === vscode.FileType.Directory
            ? createFolder(name, insertRange, inputValue)
            : createPluginFile(name, insertRange)
        );
    }

    const inputKey = findPropertyNode(inputNode);
    if (inputKey && isManifestPropertyImage(inputKey.value)) {
      const searchPath = path.join(project.root, inputValue);
      const searchEntries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(searchPath));

      // This completion get's triggered after either `.` or `./`.
      // We need to move the start position to the end of the input value.
      const insertRange = inputRange.with(position);

      return searchEntries
        .filter(([name]) => !fileIsHidden(name) && name !== 'node_modules')
        .filter(
          ([name, type]) => type === vscode.FileType.Directory || /\.(png|jpg|jpeg)$/.test(name)
        )
        .map(([name, type]) =>
          type === vscode.FileType.Directory
            ? createFolder(name, insertRange, inputValue)
            : createImageFile(name, insertRange)
        );
    }

    return log('No suggestions found for current JSON node: %s', inputNode.value);
  }
}

enum SortFactor {
  PluginModule = 'a',
  PluginModuleResolved = 'a',
  PluginModuleUnknown = 'b',
  PluginFile = 'c',
  ImageFile = 'c',
  Folder = 'd',
}

function createPluginModule(info: PluginInfo, range: vscode.Range): vscode.CompletionItem {
  const sortFactor = info.isPluginFile
    ? SortFactor.PluginModuleResolved
    : SortFactor.PluginModuleUnknown;

  return {
    range,
    kind: vscode.CompletionItemKind.Module,
    label: info.pluginReference,
    // Add a detail text on the right of the suggestion that shows the filename.
    // This can be useful for packages which don't use `app.plugin.js`.
    detail: path.basename(info.pluginFile),
    // Sort app.plugin.js plugins higher since we can be sure that they have a valid plugin.
    sortText: `${SortFactor.PluginModule}_${sortFactor}_${info.pluginReference}`,
  };
}

function createPluginFile(file: string, range: vscode.Range): vscode.CompletionItem {
  const fileName = path.basename(file);

  return {
    range,
    kind: vscode.CompletionItemKind.File,
    label: fileName,
    insertText: file,
    sortText: `${SortFactor.PluginFile}_${fileName}`,
  };
}

function createImageFile(file: string, range: vscode.Range): vscode.CompletionItem {
  const fileName = path.basename(file);

  return {
    range,
    kind: vscode.CompletionItemKind.File,
    label: fileName,
    sortText: `${SortFactor.ImageFile}_${fileName}`,
  };
}

function createFolder(dir: string, range: vscode.Range, current: string): vscode.CompletionItem {
  const dirName = path.basename(dir) + '/';
  const dirText = './'.substring(current.length) + dirName;

  return {
    range,
    kind: vscode.CompletionItemKind.Folder,
    label: dirName,
    insertText: dirText,
    sortText: `${SortFactor.Folder}_${dirName}`,
    command: { title: '', command: 'editor.action.triggerSuggest' },
  };
}
