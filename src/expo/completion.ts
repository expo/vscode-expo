import path from 'path';
import { CompletionItem, CompletionItemKind } from 'vscode';

import { PluginInfo } from './plugin';

export function createPluginModule(plugin: PluginInfo, positionValue: string): CompletionItem {
  const item = new CompletionItem(plugin.pluginReference, CompletionItemKind.Module);

  // Sort app.plugin.js plugins higher since we can be sure that they have a valid plugin.
  item.sortText = `a_${plugin.isPluginFile ? 'a' : 'b'}_${plugin.pluginReference}`;

  // Add a detail text on the right of the suggestion that shows the filename.
  // This can be useful for packages which don't use `app.plugin.js`.
  item.detail = path.basename(plugin.pluginFile);

  // vscode doesn't like to replace strings with separator characters like `-`.
  // Offset the inserted text to match what's needed to replace the current value.
  if (positionValue) {
    const bestInsertion = plugin.pluginReference.substring(positionValue.length);
    item.insertText = bestInsertion || plugin.pluginReference;
  }

  return item;
}

export function createPluginFile(plugin: PluginInfo, pluginFile: string): CompletionItem {
  const item = new CompletionItem(pluginFile, CompletionItemKind.File);

  // Sort app.plugin.js plugins higher since we can be sure that they have a valid plugin.
  item.sortText = `c_${plugin.isPluginFile ? 'c' : 'd'}_${plugin.pluginReference}`;

  return item;
}

export function createFile(assetPath: string) {
  const item = new CompletionItem(assetPath, CompletionItemKind.File);

  item.sortText = `a_${assetPath}`;

  return item;
}

export function createFolder(folderPath: string, positionValue: string): CompletionItem {
  const item = new CompletionItem(folderPath, CompletionItemKind.Folder);

  item.sortText = `e_${path.basename(folderPath)}`;

  if (positionValue) {
    const lastPathSegment = positionValue.split('/').pop() ?? positionValue;
    const bestInsertion = folderPath.substring(lastPathSegment.length)
    item.insertText = bestInsertion || folderPath;
  }

  return item;
}
