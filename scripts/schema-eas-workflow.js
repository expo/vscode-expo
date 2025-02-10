const arg = require('arg');
const fs = require('fs/promises');
const jsonSchemaTraverse = require('json-schema-traverse');
const path = require('path');

const SCHEMA_PREFIX = 'eas-workflow';
const SCHEMA_DIR = path.resolve(__dirname, '../schema');

// Execute when running in CI
if (process.env.CI) {
  generate(arg({ '--latest': Boolean })).then((schemaPath) =>
    console.log(`✓ Generated EAS Workflow schema!\n  ${schemaPath}`)
  );
}

/** Download and process the EAS Workflow schema for usage in vscode. */
async function generate(args) {
  const workflowSchema = await fetchWorkflowSchema();
  const schema = createVscodeSchema(workflowSchema);

  const schemaPath = path.join(SCHEMA_DIR, `${SCHEMA_PREFIX}.json`);

  await fs.mkdir(path.dirname(schemaPath), { recursive: true });
  await fs.writeFile(schemaPath, JSON.stringify(schema, null, 2), 'utf-8');

  return schemaPath;
}

function createVscodeSchema(workflowSchema) {
  // Ensure all `description` have a sibling `markdownDescription` property
  jsonSchemaTraverse(workflowSchema, (nested) => {
    if (nested.description && !nested.markdownDescription) {
      nested.markdownDescription = nested.description;
    }
  });

  // Add root descroptions to the schema, with links to the docs
  workflowSchema.description = `All configurable EAS Workflow properties. Learn more: https://docs.expo.dev/eas/workflows/syntax/`;
  workflowSchema.markdownDescription = `All configurable EAS Workflow properties. [Learn more](https://docs.expo.dev/eas/workflows/syntax/)`;

  return workflowSchema;
}

async function fetchWorkflowSchema() {
  const response = await fetch('https://api.expo.dev/v2/workflows/schema');
  if (!response.ok) {
    throw new Error(`Unable to fetch EAS Workflow schema, received status: ${response.status}`);
  }

  return await response.json().then(({ data }) => data);
}

// Export all methods for testing
module.exports = {
  generate,
  createVscodeSchema,
  fetchWorkflowSchema,
};
