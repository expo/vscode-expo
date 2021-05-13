import { resolveConfigPluginFunctionWithInfo } from '@expo/config-plugins/build/utils/plugin-resolver';
import JsonFile from '@expo/json-file';
import * as path from 'path';
import * as vscode from 'vscode';

import { Config } from './configuration';
import { getConfiguration } from './configuration/getConfig';
import { createNodeModuleItem, createPathCompletionItem } from './createCompletionItem';
import { Context, createContext } from './createContext';
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

  return provide(context, config);
}

async function getValidNodeModules(packageJsonPath: string) {
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

/**
 * Provide Completion Items
 */
async function provide(context: Context, config: Config): Promise<vscode.CompletionItem[]> {
  const workspace = vscode.workspace.getWorkspaceFolder(context.document.uri);

  const rootPath = config.absolutePathToWorkspace ? workspace?.uri.fsPath : undefined;

  const isPlugin = context.resolveType === 'plugin';
  if (isPlugin && context.isModule && context.packageJsonPath) {
    return (await getValidNodeModules(context.packageJsonPath)).map((plugin) =>
      createNodeModuleItem(plugin!, context.moduleImportRange)
    );
  }

  const folderPath = getPathOfFolderToLookupFiles(
    context.document.uri.fsPath,
    context.fromString,
    rootPath,
    config.mappings
  );

  // Only allow .js files for plugins
  // Only allow png and jpg for images, the schema prevents anything except png but this isn't technically correct.
  const allowedExtensions = isPlugin ? /\.js$/ : /.(png|jpe?g)/;

  const childrenOfPath = (await getChildrenOfPath(folderPath, config)).filter((file) => {
    return !file.isFile || allowedExtensions.test(file.file);
  });
  return [...childrenOfPath.map((child) => createPathCompletionItem(child, config, context))];
}
