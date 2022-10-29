import vscode from 'vscode';

import { setupPluginsValidation } from './configPlugins';

/**
 * Set up enhancements for the App manifest file.
 * This includes plugin validation, file path validation and other enhancements.
 */
export async function setupXdlManifest(context: vscode.ExtensionContext) {
  setupPluginsValidation(context);
}
