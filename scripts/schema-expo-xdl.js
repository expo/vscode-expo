const arg = require('arg');
const assert = require('assert');
const execa = require('execa');
const fs = require('fs');
const jsonSchemaTraverse = require('json-schema-traverse');
const fetch = require('node-fetch');
const path = require('path');
const { major } = require('semver');

const SCHEMA_PREFIX = 'expo-xdl';
const SCHEMA_DIR = path.resolve(__dirname, '../schema');

// Execute when not running in Jest
if (!process.env.JEST_WORKER_ID) {
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

  const sdkVersion = await resolveVersion(args['--sdk-version'] || 'latest');
  const sdkSchema = await resolveSchema(sdkVersion);
  const schema = vscodeSchema(sdkVersion, sdkSchema);

  const schemaPath = path.resolve(
    SCHEMA_DIR,
    args['--latest'] ? `${SCHEMA_PREFIX}.json` : `${SCHEMA_PREFIX}-${sdkVersion}.json`
  );

  await fs.promises.mkdir(path.dirname(schemaPath), { recursive: true });
  await fs.promises.writeFile(schemaPath, JSON.stringify(schema, null, 2), 'utf-8');

  return schemaPath;
}

/** Find the major SDK version from the `expo` package. */
async function resolveVersion(tagOrVersion = 'latest') {
  let stdout = '';

  try {
    ({ stdout } = await execa('npm', ['info', `expo@${tagOrVersion}`, '--json', 'version']));
  } catch (error) {
    throw new Error(`Could not resolve expo@${tagOrVersion}, reason:\n${error.message || error}`);
  }

  // thanks npm, for returning a "" json string value for invalid versions
  if (!stdout) {
    throw new Error(`Could not resolve expo@${tagOrVersion}, reason:\nInvalid version`);
  }

  // thanks npm, for returning a "x.x.x" json value...
  if (stdout.startsWith('"')) {
    stdout = `[${stdout}]`;
  }

  return major(JSON.parse(stdout).at(-1));
}

/** Download the latest XDL schema by major Expo SDK version. */
async function resolveSchema(sdkVersion) {
  return fetch(`https://exp.host/--/api/v2/project/configuration/schema/${sdkVersion}.0.0`)
    .then((response) => response.json())
    .then((json) => json.data.schema);
}

/**
 * Pre-process the XDL schema to make it compatible with vscode.
 * This modifies the provided `xdlSchema` object.
 */
function vscodeSchema(xdlVersion, xdlSchema) {
  jsonSchemaTraverse(
    xdlSchema,
    (nested, _nestedPath, _root, _parentPath, parentKey, parent, parentKeyIndex) => {
      schemaRemoveAutoGenerated(nested, parent, parentKey, parentKeyIndex);
      schemaAddBareWorkflowDescription(nested);
      schemaAddMarkdownDescription(nested);
      schemaAddPatternErrorDescription(nested);
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
function schemaRemoveAutoGenerated(
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
function schemaAddBareWorkflowDescription(schema) {
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
function schemaAddMarkdownDescription(schema) {
  if (schema.description && !schema.markdownDescription) {
    schema.markdownDescription = schema.description;
  }
}

/**
 * Add a human-readable error message to pattern validation.
 * Only (sub)schemas with both a `pattern` and `meta.regexHuman` will get this.
 * @see https://github.com/microsoft/vscode-json-languageservice/blob/12275e448a91973777c94a2e5d92c961f281231a/src/jsonSchema.ts#L79
 */
function schemaAddPatternErrorDescription(schema) {
  if (schema.pattern && schema.meta?.regexHuman) {
    schema.patternErrorMessage = schema.meta.regexHuman;
  }
}

// Export all methods for testing
module.exports = {
  generate,
  resolveVersion,
  resolveSchema,
  vscodeSchema,
  schemaRemoveAutoGenerated,
  schemaAddBareWorkflowDescription,
  schemaAddMarkdownDescription,
  schemaAddPatternErrorDescription,
};
