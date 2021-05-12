import * as vscode from 'vscode';
import { Config } from './configuration';
import { createContext, Context } from './createContext';
import JsonFile from '@expo/json-file';
import { createPathCompletionItem, createNodeModuleItem } from './createCompletionItem';
import { getPathOfFolderToLookupFiles, getChildrenOfPath } from '../utils/fileUtils';

import { CompletionItemProvider, DocumentSelector } from 'vscode';
import { appJsonPattern } from '../utils/parseExpoJson';
import { getConfiguration } from './configuration/getConfig';
import * as path from 'path';
import { resolveConfigPluginFunctionWithInfo } from '@expo/config-plugins/build/utils/plugin-resolver';

export interface PathIntellisenseProvider {
  selector: DocumentSelector;
  provider: CompletionItemProvider;
  triggerCharacters?: string[];
}

export const JavaScriptProvider: PathIntellisenseProvider = {
  selector: appJsonPattern,
  provider: {
    provideCompletionItems,
  },
  triggerCharacters: [path.sep, '.', '"'],
};

async function provideCompletionItems(
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
  const { fromString } = context;

  //   if (!fromString || fromString.length === 0) {
  //     return false;
  //   }

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

  const childrenOfPath = await getChildrenOfPath(_path, config);
  return [...childrenOfPath.map((child) => createPathCompletionItem(child, config, context))];
}
