import { resolveConfigPluginFunctionWithInfo } from '@expo/config-plugins/build/utils/plugin-resolver';
import JsonFile from '@expo/json-file';
import * as path from 'path';
import * as vscode from 'vscode';

import { Config, getConfiguration } from './configuration/getConfiguration';
import { createNodeModuleItem, createPathCompletionItem } from './createCompletionItem';
import { Context, createContext, ResolveType } from './createContext';
import { getChildrenOfPath, getPathOfFolderToLookupFiles } from './fileUtils';

export async function provideCompletionItems(
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.CompletionItem[]> {
  const context = createContext(document, position);

  if (!context) {
    return [];
  }

  const config = await getConfiguration(document.uri);

  return provideAsync(context, config);
}

/**
 * Read the package.json and get all of the dependencies that have a valid config plugin.
 */
async function getValidNodeModulesAsync(packageJsonPath: string) {
  const projectRoot = path.dirname(packageJsonPath);

  const pkg = await JsonFile.readAsync(packageJsonPath);

  if (pkg.dependencies) {
    return Object.keys(pkg.dependencies)
      .map((pkgName) => {
        try {
          return resolveConfigPluginFunctionWithInfo(projectRoot, pkgName);
        } catch {}
      })
      .filter(Boolean);
  }
  return [];
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

  const isPlugin = context.resolveType === 'plugin';
  // Attempt to get node modules from the package.json that have a valid config plugin.
  // This doesn't support monorepos when the package isn't found in the dependencies object.
  if (isPlugin && context.isModule && context.packageJsonPath) {
    return (await getValidNodeModulesAsync(context.packageJsonPath)).map((plugin) =>
      createNodeModuleItem(plugin!, context.moduleImportRange)
    );
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
