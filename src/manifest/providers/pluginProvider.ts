import * as vscode from 'vscode';
import { Config } from './configuration';
import { createContext, Context } from './createContext';

import { createPathCompletionItem } from './createCompletionItem';
import { getPathOfFolderToLookupFiles, getChildrenOfPath } from '../utils/fileUtils';

import { CompletionItemProvider, DocumentSelector } from 'vscode';
import { appJsonPattern } from '../utils/parseExpoJson';
import { getConfiguration } from './configuration/getConfig';
import { sep } from 'path';

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
  triggerCharacters: [sep, '.', '"'],
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

  if (!fromString || fromString.length === 0) {
    return false;
  }

  return true;
}

/**
 * Provide Completion Items
 */
async function provide(context: Context, config: Config): Promise<vscode.CompletionItem[]> {
  const workspace = vscode.workspace.getWorkspaceFolder(context.document.uri);

  const rootPath = config.absolutePathToWorkspace ? workspace?.uri.fsPath : undefined;

  const path = getPathOfFolderToLookupFiles(
    context.document.uri.fsPath,
    context.fromString,
    rootPath,
    config.mappings
  );

  const childrenOfPath = await getChildrenOfPath(path, config);
  return [...childrenOfPath.map((child) => createPathCompletionItem(child, config, context))];
}
