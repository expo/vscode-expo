import vscode from 'vscode';

/**
 * The configuration property the JSON schemas should be stored at.
 */
export const SCHEMA_PROP = 'json.schemas';

/**
 * The JSON schema name, used to identify schemas added by this plugin.
 */
export const SCHEMA_NAME = 'vscode-expo-manifest';

/**
 * Unregister the Expo manifest JSON schema from the global config.
 * @deprecated Remove in next version
 */
export async function unregisterGlobalSchema() {
  const config = vscode.workspace.getConfiguration();
  const schemas = config.inspect(SCHEMA_PROP);
  const oldValue = (schemas?.globalValue || []) as any[];
  const newValue = oldValue.filter((schema) => schema.name !== SCHEMA_NAME);

  await config.update('json.schemas', newValue, vscode.ConfigurationTarget.Global);
}
