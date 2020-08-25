import * as xdl from '@expo/xdl/build/project/ExpSchema';

export interface ManifestSchema {
  $schema: string,
  type: 'object',
  version: string,
  additionalProperties: true,
  required: string[],
  properties: {
    expo: any,
  },
};

/**
 * Fetch the XDL schema for a specific Expo SDK version.
 */
export async function getSchema(sdkVersion: string) {
	const xdlSchema = await xdl.getSchemaAsync(sdkVersion);
  return createFromXdl(sdkVersion, xdlSchema);
}

/**
 * Create a JSON schema object from XDL schema.
 * This will wrap the properties into `expo` validation.
 */
export function createFromXdl(sdkVersion: string, xdlSchema: object): ManifestSchema {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    version: sdkVersion,
    additionalProperties: true,
    required: [
      'expo',
    ],
    properties: {
      expo: xdlSchema,
    },
  };
}
