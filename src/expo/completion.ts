import path from 'path';
import vscode from 'vscode';

import { PluginInfo } from './plugin';

enum SortFactor {
  PluginModule = 'a',
  PluginModuleResolved = 'a',
  PluginModuleUnknown = 'b',
  PluginFile = 'c',
  ImageFile = 'c',
  Folder = 'd',
}

export function createPluginModule(info: PluginInfo, range: vscode.Range): vscode.CompletionItem {
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

export function createPluginFile(file: string, range: vscode.Range): vscode.CompletionItem {
  const fileName = path.basename(file);

  return {
    range,
    kind: vscode.CompletionItemKind.File,
    label: fileName,
    insertText: file,
    sortText: `${SortFactor.PluginFile}_${fileName}`,
  };
}

export function createImageFile(file: string, range: vscode.Range): vscode.CompletionItem {
  const fileName = path.basename(file);

  return {
    range,
    kind: vscode.CompletionItemKind.File,
    label: fileName,
    sortText: `${SortFactor.ImageFile}_${fileName}`,
  };
}

export function createFolder(
  dir: string,
  range: vscode.Range,
  current: string
): vscode.CompletionItem {
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
