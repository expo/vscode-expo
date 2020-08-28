import vscode from 'vscode';

import * as manifest from './manifest';

export async function activate(context: vscode.ExtensionContext) {
  try {
    await manifest.activateGlobalSchema(context);
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
