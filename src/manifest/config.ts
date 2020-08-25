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
 * Register the Expo manifest JSON schema to the global config.
 * This also filters out existing or previous manifest registrations.
 */
export async function registerGlobalSchema(schemaUri: vscode.Uri) {
  const config = vscode.workspace.getConfiguration();
  const schemas = config.inspect(SCHEMA_PROP);
  const oldValue = (schemas?.globalValue || []) as any[];
  const newValue = oldValue.filter(schema => schema.name !== SCHEMA_NAME);

  newValue.push({
    name: SCHEMA_NAME,
    url: schemaUri.toString(),
    fileMatch: [
      'app.json',
      'app.config.json'
    ],
  });

  await config.update('json.schemas', newValue, vscode.ConfigurationTarget.Global);
}

/**
 * Unregister the Expo manifest JSON schema from the global config.
 */
export async function unregisterGlobalSchema() {
  const config = vscode.workspace.getConfiguration();
  const schemas = config.inspect(SCHEMA_PROP);
  const oldValue = (schemas?.globalValue || []) as any[];
  const newValue = oldValue.filter(schema => schema.name !== SCHEMA_NAME);

  await config.update('json.schemas', newValue, vscode.ConfigurationTarget.Global);
}
