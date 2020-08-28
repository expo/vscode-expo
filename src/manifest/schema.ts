import * as xdl from '@expo/xdl/build/project/ExpSchema';
import jsonSchemaTraverse from 'json-schema-traverse';

type JsonSchema = {
  [key: string]: any;
};

export type ManifestSchema = {
  $schema: string;
  type: 'object';
  version: string;
  additionalProperties: true;
  required: string[];
  properties: {
    expo: any;
  };
};

/**
 * Fetch the XDL schema for a specific Expo SDK version.
 */
export async function getSchema(sdkVersion: string) {
  const xdlSchema = await xdl.getSchemaAsync(sdkVersion);
  return createFromXdl(sdkVersion, xdlSchema);
}

/**
 * Create a vscode compatible JSON schema object from XDL schema.
 * It also adds a `meta` property to know when this schema was generated.
 * This will try to make some adjustments to the downloaded schema:
 *   1. wrap the properties into an `expo` property for managed validation
 *   2. copy `description` properties into `markdownDescription` to render content as markdown
 *
 * @remark When something fails in #2, it falls back to the original schema and only apply #1.
 * @see https://github.com/microsoft/vscode/blob/1dff50d211472de4667db626ef2d6d32265eb0e6/src/vs/workbench/services/configuration/common/configurationExtensionPoint.ts#L64
 */
export function createFromXdl(sdkVersion: string, xdlSchema: JsonSchema): ManifestSchema {
  // note: we need to create a copy, if something fails we need the original object
  let enhancedSchema = JSON.parse(JSON.stringify(xdlSchema));

  try {
    jsonSchemaTraverse(enhancedSchema, (nestedSchema: JsonSchema) => {
      if (nestedSchema.description && !nestedSchema.markdownDescription) {
        nestedSchema.markdownDescription = nestedSchema.description;
      }
    });
  } catch (error) {
    // todo: add telemetry, fallback to original schema
    enhancedSchema = xdlSchema;
  }

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    version: sdkVersion,
    additionalProperties: true,
    required: ['expo'],
    properties: {
      expo: enhancedSchema,
    },
  };
}
