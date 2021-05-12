import * as path from 'path';
import vscode, { languages } from 'vscode';

import { provideCompletionItems } from '../providers/pluginProvider';
import { appJsonPattern } from '../utils/parseExpoJson';

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
