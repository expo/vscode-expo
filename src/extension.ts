import * as vscode from 'vscode';

import { setupCompletionItemProvider } from './completion/setupCompletionItemProvider';
import * as manifest from './manifest';
import { setupPreview } from './preview/setupPreview';

export async function activate(context: vscode.ExtensionContext) {
  try {
    await manifest.activateGlobalSchema(context);
    await setupCompletionItemProvider(context);
    await setupPreview(context);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Oops, looks like we couldn't activate the Expo manifest tools: ${error.message}`
    );
  }
}

export async function deactivate() {
  try {
    await manifest.deactivateGlobalSchema();
  } catch (error) {
    vscode.window.showErrorMessage(
      `Oops, looks like we couldn't deactivate the Expo manifest tools: ${error.message}`
    );
  }
}
