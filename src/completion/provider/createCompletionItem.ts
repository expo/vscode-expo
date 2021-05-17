import * as vscode from 'vscode';

import { Config } from './configuration';
import { Context } from './createContext';
import { FileInfo } from './fileUtils';

export function createPathCompletionItem(
  fileInfo: FileInfo,
  config: Config,
  context: Context
): vscode.CompletionItem {
  return fileInfo.isFile
    ? createFileItem(fileInfo, config, context)
    : createFolderItem(fileInfo, config.autoSlash, context.importRange);
}

export function createNodeModuleItem(
  pluginInfo: {
    plugin: Function;
    pluginFile: string;
    pluginReference: string;
    isPluginFile: boolean;
  },
  importRange: vscode.Range
): vscode.CompletionItem {
  const moduleName = pluginInfo.pluginReference;
  //   const hasProps = pluginInfo.plugin.length > 1
  return {
    label: moduleName,
    kind: vscode.CompletionItemKind.Module,
    textEdit: new vscode.TextEdit(importRange, moduleName),
    // Sort app.plugin.js plugins higher since we can be sure that they have a valid plugin.
    sortText: `a_${pluginInfo.isPluginFile ? 'a' : 'b'}_${moduleName}`,
  };
}

function createFolderItem(
  fileInfo: FileInfo,
  autoSlash: boolean,
  importRange: vscode.Range
): vscode.CompletionItem {
  const newText = autoSlash ? `${fileInfo.file}/` : `${fileInfo.file}`;

  return {
    label: fileInfo.file,
    kind: vscode.CompletionItemKind.Folder,
    textEdit: new vscode.TextEdit(importRange, newText),
    sortText: `d_${fileInfo.file}`,
  };
}

function createFileItem(
  fileInfo: FileInfo,
  config: Config,
  context: Context
): vscode.CompletionItem {
  const textEdit = createCompletionItemTextEdit(fileInfo, config, context);

  return {
    label: fileInfo.file,
    kind: vscode.CompletionItemKind.File,
    sortText: `c_${fileInfo.file}`,
    textEdit,
  };
}

function createCompletionItemTextEdit(fileInfo: FileInfo, config: Config, context: Context) {
  // Use entire file name for images
  const index =
    context.resolveType === 'plugin' ? fileInfo.file.lastIndexOf('.') : fileInfo.file.length;
  const newText = index !== -1 ? fileInfo.file.substring(0, index) : fileInfo.file;
  return new vscode.TextEdit(context.importRange, newText);
}
