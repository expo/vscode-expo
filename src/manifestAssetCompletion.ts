import { findNodeAtOffset, getNodeValue } from 'jsonc-parser';
import path from 'path';
import vscode from 'vscode';

import { createFolder, createImageFile } from './expo/completion';
import { isManifestPropertyImage, manifestPattern } from './expo/manifest';
import { ExpoProjectCache } from './expo/project';
import { createDebug } from './utils/debug';
import { fileIsHidden, fileIsImage } from './utils/file';
import {
  findPropertyNode,
  getDocumentRange,
  getNodeValueRange,
  isPropertyNode,
} from './utils/json';
import { ExpoCompletionProvider } from './vscode/completion';

const log = createDebug('manifest-asset-completion');

export class ManifestAssetCompletionProvider extends ExpoCompletionProvider {
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

    const inputKey = findPropertyNode(inputNode);
    const inputValue = getNodeValue(inputNode) as string;

    if (inputKey && isManifestPropertyImage(inputKey.value)) {
      const searchPath = path.join(project.root, inputValue);
      const searchEntries = await vscode.workspace.fs.readDirectory(vscode.Uri.file(searchPath));

      // This completion get's triggered after either `.` or `./`.
      // We need to move the start position to the end of the input value.
      const insertRange = getDocumentRange(document, getNodeValueRange(inputNode)).with(position);

      return searchEntries
        .filter(([name]) => !fileIsHidden(name) && name !== 'node_modules')
        .filter(([name, type]) => type === vscode.FileType.Directory || fileIsImage(name))
        .map(([name, type]) =>
          type === vscode.FileType.Directory
            ? createFolder(name, insertRange, inputValue)
            : createImageFile(name, insertRange)
        );
    }
  }
}
