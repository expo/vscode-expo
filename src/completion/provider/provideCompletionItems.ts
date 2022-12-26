import * as vscode from 'vscode';

import { isManifestFileReferencesEnabled } from '../../settings';
import { Config, getConfiguration } from './configuration/getConfiguration';
import { createPathCompletionItem } from './createCompletionItem';
import { Context, createContext, ResolveType } from './createContext';
import { getChildrenOfPath, getPathOfFolderToLookupFiles } from './fileUtils';

export async function provideCompletionItems(
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.CompletionItem[]> {
  if (!isManifestFileReferencesEnabled(document)) {
    return [];
  }

  const context = createContext(document, position);

  if (!context) {
    return [];
  }

  const config = await getConfiguration(document.uri);

  return provideAsync(context, config);
}

function getResolveTypeRegExp(resolveType?: ResolveType): RegExp {
  switch (resolveType) {
    case 'image':
      // Only allow png and jpg for images, the schema prevents anything except png but this isn't technically correct.
      return /.(png|jpe?g)/;
    case 'plugin':
    default:
      // Only allow .js files for plugins
      return /\.js$/;
  }
}

/**
 * Provide completion items
 */
async function provideAsync(context: Context, config: Config): Promise<vscode.CompletionItem[]> {
  const workspace = vscode.workspace.getWorkspaceFolder(context.document.uri);

  const rootPath = config.absolutePathToWorkspace ? workspace?.uri.fsPath : undefined;

  // TODO(cedric): move asset completion items to it's own dedicated provider, like plugins
  if (context.resolveType === 'plugin') {
    return []; // Abort when resolving plugins, superseded by `manifestPluginCompletions`
  }

  const folderPath = getPathOfFolderToLookupFiles(
    context.document.uri.fsPath,
    context.fromString,
    rootPath,
    config.mappings
  );

  const allowedExtensions = getResolveTypeRegExp(context.resolveType);

  const childrenOfPath = (await getChildrenOfPath(folderPath, config)).filter(
    (file) => !file.isFile || allowedExtensions.test(file.file)
  );

  return [...childrenOfPath.map((child) => createPathCompletionItem(child, config, context))];
}
