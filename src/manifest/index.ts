import * as vscode from 'vscode';
import * as xdl from '@expo/xdl';
import * as Config from './config';
import * as Schema from './schema';
import * as Storage from './storage';

/**
 * Download, store and activate the global Expo manifest JSON schema.
 * This will not check if the cache has an existing one, because we always want to fetch the latest.
 */
export async function activateGlobalSchema(context: vscode.ExtensionContext) {
  const latestSdk = await xdl.Versions.newestReleasedSdkVersionAsync();
  const schemaFile = await Schema.getSchema(latestSdk.version);
  const schemaPath = await Storage.storeSchema(context, schemaFile);
  await Config.registerGlobalSchema(schemaPath);
}

/**
 * Remove any existing Expo manifest JSON schema from global config.
 */
export async function deactivateGlobalSchema() {
  await Config.unregisterGlobalSchema();
}
