// Inspired by https://github.com/ChristianKohler/PathIntellisense/tree/master

import * as path from 'path';
import vscode, { languages } from 'vscode';

import { appJsonPattern } from '../manifest/utils/parseExpoJson';
import { subscribeToTsConfigChanges } from './provider/configuration/getTsconfig';
import { provideCompletionItems } from './provider/provideCompletionItems';

const triggerCharacters = [path.sep, '.', '"'];

export function setupCompletionItemProvider(context: vscode.ExtensionContext) {
  // Subscribe to the ts config changes
  context.subscriptions.push(...subscribeToTsConfigChanges());

  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      appJsonPattern,
      {
        provideCompletionItems,
      },
      ...triggerCharacters
    )
  );
}
