import * as vscode from 'vscode';

import { setupCompletionItemProvider } from './completion/setupCompletionItemProvider';
import { setupXdlManifest } from './manifest';
import { setupPreview } from './preview/setupPreview';

export async function activate(context: vscode.ExtensionContext) {
  try {
    await setupXdlManifest(context);
    await setupCompletionItemProvider(context);
    await setupPreview(context);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Oops, looks like we can't fully activate Expo Tools: ${error.message}`
    );
  }
}
