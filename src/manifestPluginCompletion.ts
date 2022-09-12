import { findNodeAtOffset, getNodeValue } from 'jsonc-parser';
import path from 'path';
import vscode from 'vscode';

import { createFolder, createPluginFile, createPluginModule } from './expo/completion';
import { findManifestPlugins, manifestPattern } from './expo/manifest';
import { resolvePackagePluginsInfo, resolvePluginInfo } from './expo/plugin';
import { ExpoProjectCache } from './expo/project';
import { createDebug } from './utils/debug';
import { fileIsHidden } from './utils/file';
import { getDocumentRange, getNodeValueRange, isPropertyNode } from './utils/json';
import { ExpoCompletionProvider } from './vscode/completion';

const log = createDebug('manifest-plugin-completion');

export class ManifestPluginCompletionProvider extends ExpoCompletionProvider {
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
    } else if (isPropertyNode(inputNode) || inputNode.type !== 'string') {
      return log('Current JSON node is not a string: %s', inputNode.type);
    }

    if (token.isCancellationRequested) return null;

    const plugins = findManifestPlugins(project.manifest);
    if (!plugins || !getDocumentRange(document, plugins).contains(position)) {
      return null;
    }

    const inputValue = getNodeValue(inputNode) as string;
    const inputRange = getDocumentRange(document, getNodeValueRange(inputNode));
    const inputIsPath = !!inputValue && /^(\/|\.)/.test(inputValue);

    if (!inputIsPath) {
      return resolvePackagePluginsInfo(project).map((info) => createPluginModule(info, inputRange));
    }

    const searchPath = path.join(project.root, inputValue);
    const searchEntries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(searchPath));

    // This completion get's triggered after either `.` or `./`.
    // We need to move the start position to the end of the input value.
    const insertRange = inputRange.with(position);

    return searchEntries
      .filter(([name]) => !fileIsHidden(name) && name !== 'node_modules')
      .filter(
        ([name, type]) =>
          type === vscode.FileType.Directory ||
          !!resolvePluginInfo(project.root, './' + path.join(inputValue, name))
      )
      .map(([name, type]) =>
        type === vscode.FileType.Directory
          ? createFolder(name, insertRange, inputValue)
          : createPluginFile(name, insertRange)
      );
  }
}
