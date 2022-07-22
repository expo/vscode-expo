import vscode from 'vscode';

import { setupDefinition, setupPluginsValidation } from './configPlugins';

/**
 * Download, store and activate the global Expo manifest JSON schema.
 * This will not check if the cache has an existing one, because we always want to fetch the latest.
 */
export async function setupXdlManifest(context: vscode.ExtensionContext) {
  setupPluginsValidation(context);
  setupDefinition();
}
