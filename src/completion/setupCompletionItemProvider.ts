import * as path from 'path';
import vscode, { languages } from 'vscode';

import { appJsonPattern } from '../manifest/utils/parseExpoJson';
import { provideCompletionItems } from './provider/provideCompletionItems';

export function setupCompletionItemProvider(context: vscode.ExtensionContext) {
  const triggerCharacters = [path.sep, '.', '"'];
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
