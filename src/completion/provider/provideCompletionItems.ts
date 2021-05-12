import { resolveConfigPluginFunctionWithInfo } from '@expo/config-plugins/build/utils/plugin-resolver';
import JsonFile from '@expo/json-file';
import * as path from 'path';
import * as vscode from 'vscode';

import { getChildrenOfPath, getPathOfFolderToLookupFiles } from './fileUtils';
import { Config } from './configuration';
import { getConfiguration } from './configuration/getConfig';
import { createNodeModuleItem, createPathCompletionItem } from './createCompletionItem';
import { Context, createContext } from './createContext';

export async function provideCompletionItems(
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.CompletionItem[]> {
  const context = createContext(document, position);

  // Only support plugins for now
  if (context.resolveType !== 'plugin') {
    return [];
  }

  const config = await getConfiguration(document.uri);

  return shouldProvide(context, config) ? provide(context, config) : [];
}

/**
 * Checks if we should provide any CompletionItems
 * @param context
 * @param config
 */
function shouldProvide(context: Context, config: Config): boolean {
  return true;
}

/**
 * Provide Completion Items
 */
async function provide(context: Context, config: Config): Promise<vscode.CompletionItem[]> {
  const workspace = vscode.workspace.getWorkspaceFolder(context.document.uri);

  const rootPath = config.absolutePathToWorkspace ? workspace?.uri.fsPath : undefined;

  const { fromString } = context;
  if (
    (!fromString || !fromString.length || !fromString.match(/^(\/|\.)/)) &&
    context.packageJsonPath
  ) {
    const projectRoot = path.dirname(context.packageJsonPath);

    // is module...
    const pkg = await JsonFile.readAsync(context.packageJsonPath);

    const validPlugins: {
      plugin: any;
      pluginFile: string;
      pluginReference: string;
      isPluginFile: boolean;
    }[] = [];
    if (pkg.dependencies) {
      for (const pkgName of Object.keys(pkg.dependencies)) {
        try {
          validPlugins.push({ ...resolveConfigPluginFunctionWithInfo(projectRoot, pkgName) });
        } catch {}
      }
    }

    return validPlugins.map((plugin) => createNodeModuleItem(plugin, context.moduleImportRange));
  }

  const _path = getPathOfFolderToLookupFiles(
    context.document.uri.fsPath,
    context.fromString,
    rootPath,
    config.mappings
  );

  const childrenOfPath = (await getChildrenOfPath(_path, config)).filter((file) => {
    // Only allow .js files
    return !file.isFile || /\.js$/.test(file.file);
  });
  return [...childrenOfPath.map((child) => createPathCompletionItem(child, config, context))];
}
