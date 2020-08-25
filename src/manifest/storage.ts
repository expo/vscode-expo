import vscode from 'vscode';
import * as path from 'path';
import { ManifestSchema } from './schema';

/**
 * Get the absolute path to a schema file from the global storage path.
 */
export function schemaUri(context: vscode.ExtensionContext, version: string) {
  return vscode.Uri.file(
    path.join(context.globalStoragePath, `manifest-${version}.json`)
  );
}

/**
 * Check if a schema exists in storage for the provided Expo SDK version.
 */
export async function hasSchema(context: vscode.ExtensionContext, version: string) {
  try {
    await vscode.workspace.fs.stat(schemaUri(context, version));
  } catch {
    return false;
  }

  return true;
}

/**
 * Store the fetched and prepared JSON schema into storage.
 * This will return the URI where the schema was writen to.
 */
export async function storeSchema(context: vscode.ExtensionContext, schema: ManifestSchema) {
  const uri = schemaUri(context, schema.version);
  const json = JSON.stringify(schema);
  await vscode.workspace.fs.writeFile(uri, Buffer.from(json));
  return uri;
}
