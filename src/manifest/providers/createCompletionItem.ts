import * as vscode from 'vscode';

import { FileInfo } from '../utils/fileUtils';
import { Config } from './configuration';
import { Context } from './createContext';

export function createPathCompletionItem(
  fileInfo: FileInfo,
  config: Config,
  context: Context
): vscode.CompletionItem {
  return fileInfo.isFile
    ? createFileItem(fileInfo, config, context)
    : createFolderItem(fileInfo, config.autoSlash, context.importRange);
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
    sortText: `b_${fileInfo.file}`,
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
    sortText: `a_${fileInfo.file}`,
    textEdit,
  };
}

function createCompletionItemTextEdit(fileInfo: FileInfo, config: Config, context: Context) {
  const index = fileInfo.file.lastIndexOf('.');
  const newText = index !== -1 ? fileInfo.file.substring(0, index) : fileInfo.file;
  return new vscode.TextEdit(context.importRange, newText);
}
