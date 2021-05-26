import * as vscode from 'vscode';

import { Config } from './configuration/getConfiguration';
import { Context } from './createContext';
import { FileInfo } from './fileUtils';

export function createPathCompletionItem(
  fileInfo: FileInfo,
  config: Config,
  context: Context
): vscode.CompletionItem {
  return fileInfo.isFile
    ? createFileItem(fileInfo, config, context)
    : createFolderItem(
        fileInfo,
        // Currently just auto slash by default.
        // One downside to this is using the shorthand `./folder/index.js` as `./folder` is a bit harder since it'll add `./folder/` by default.
        // But `./folder/` is also a valid shorthand for `./folder/index.js` in our plugin so this is fine.
        true,
        context.importRange
      );
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
    range: importRange,
    insertText: new vscode.SnippetString(moduleName),
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
    range: importRange,
    insertText: new vscode.SnippetString(newText),
    sortText: `d_${fileInfo.file}`,
    // If we auto slash, then trigger the next suggestion automatically.
    command: autoSlash
      ? {
          title: '',
          command: 'editor.action.triggerSuggest',
        }
      : undefined,
  };
}

function createFileItem(
  fileInfo: FileInfo,
  config: Config,
  context: Context
): vscode.CompletionItem {
  const insertText = createCompletionItemTextEdit(fileInfo, config, context);

  return {
    label: fileInfo.file,
    kind: vscode.CompletionItemKind.File,
    range: context.importRange,
    insertText,
    sortText: `c_${fileInfo.file}`,
  };
}

function createCompletionItemTextEdit(fileInfo: FileInfo, config: Config, context: Context) {
  // Use entire file name for images
  const index =
    context.resolveType === 'plugin' ? fileInfo.file.lastIndexOf('.') : fileInfo.file.length;
  const newText = index !== -1 ? fileInfo.file.substring(0, index) : fileInfo.file;
  return new vscode.SnippetString(newText);
}
