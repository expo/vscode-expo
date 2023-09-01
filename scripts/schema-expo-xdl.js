const arg = require('arg');
const assert = require('assert');
const fs = require('fs/promises');
const jsonSchemaTraverse = require('json-schema-traverse');
const path = require('path');

const { resolveExpoVersion, resolveExpoSchema } = require('./utils/expo');

const SCHEMA_PREFIX = 'expo-xdl';
const SCHEMA_DIR = path.resolve(__dirname, '../schema');

// Execute when running in CI
if (process.env.CI) {
  generate(
    arg({
      '--sdk-version': Number,
      '--latest': Boolean,
    })
  ).then((schemaPath) => console.log(`✓ Generated XDL schema!\n  ${schemaPath}`));
}

/** Download and process the XDL schema for usage in vscode. */
async function generate(args) {
  if (args['--latest']) {
    assert(!args['--sdk-version'], `--latest can't be used with --sdk-version`);
  }

  const sdkVersion = await resolveExpoVersion(args['--sdk-version'] || 'latest');
  const sdkSchema = await resolveExpoSchema(sdkVersion);
  const schema = createVscodeSchema(sdkVersion, sdkSchema);

  const schemaPath = path.resolve(
    SCHEMA_DIR,
    args['--latest'] ? `${SCHEMA_PREFIX}.json` : `${SCHEMA_PREFIX}-${sdkVersion}.json`
  );

  await fs.mkdir(path.dirname(schemaPath), { recursive: true });
  await fs.writeFile(schemaPath, JSON.stringify(schema, null, 2), 'utf-8');

  return schemaPath;
}

/**
 * Pre-process the XDL schema to make it compatible with vscode.
 * This modifies the provided `xdlSchema` object.
 */
function createVscodeSchema(xdlVersion, xdlSchema) {
  jsonSchemaTraverse(
    xdlSchema,
    (nested, _nestedPath, _root, _parentPath, parentKey, parent, parentKeyIndex) => {
      traverseSchemaRemoveAutoGenerated(nested, parent, parentKey, parentKeyIndex);
      traverseSchemaAddBareWorkflowDescription(nested);
      traverseSchemaAddMarkdownDescription(nested);
      traverseSchemaAddPatternErrorDescription(nested);
    }
  );

  // note: we need to move over definitions from the schema and put them into root
  const { definitions } = xdlSchema;
  if (definitions) {
    delete xdlSchema.definitions;
  }

  return {
    type: 'object',
    description: 'The Expo manifest (app.json) validation and documentation.',
    version: `${xdlVersion}.0.0`,
    $schema: 'http://json-schema.org/draft-07/schema#',
    // Do not warn about additional properties for plain React Native apps
    additionalProperties: true,
    definitions,
    properties: {
      expo: xdlSchema,
    },
  };
}

/** Remove auto-generated properties from the schema, they aren't configurable by the user. */
function traverseSchemaRemoveAutoGenerated(
  nested,
  parent = undefined,
  parentKey = undefined,
  parentKeyIndex = undefined
) {
  // Only edit nodes with parents that are autogenerated
  if (nested.meta?.autogenerated && parent && parentKey && parentKeyIndex) {
    delete parent[parentKey][parentKeyIndex];
  }
}

/** Move bare workflow notes to the property descriptions, if available. */
function traverseSchemaAddBareWorkflowDescription(schema) {
  if (schema.meta?.bareWorkflow) {
    const description = schema.description || '';
    const bareNotes = schema.meta.bareWorkflow;

    schema.description = `${description}\n\n**Bare workflow** - ${bareNotes}`.trim();
  }
}

/**
 * Add a `markdownDescription` property based on the `description`, if not defined.
 * Only the `markdownDescription` property allows rendering markdown in vscode.
 */
function traverseSchemaAddMarkdownDescription(schema) {
  if (schema.description && !schema.markdownDescription) {
    schema.markdownDescription = schema.description;
  }
}

/**
 * Add a human-readable error message to pattern validation.
 * Only (sub)schemas with both a `pattern` and `meta.regexHuman` will get this.
 * @see https://github.com/microsoft/vscode-json-languageservice/blob/12275e448a91973777c94a2e5d92c961f281231a/src/jsonSchema.ts#L79
 */
function traverseSchemaAddPatternErrorDescription(schema) {
  if (schema.pattern && schema.meta?.regexHuman) {
    schema.patternErrorMessage = schema.meta.regexHuman;
  }
}

// Export all methods for testing
module.exports = {
  generate,
  resolveExpoVersion,
  resolveExpoSchema,
  createVscodeSchema,
  traverseSchemaRemoveAutoGenerated,
  traverseSchemaAddBareWorkflowDescription,
  traverseSchemaAddMarkdownDescription,
  traverseSchemaAddPatternErrorDescription,
};
