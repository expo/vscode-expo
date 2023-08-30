const { expect } = require('chai');
const jsonTraverse = require('json-schema-traverse');

const {
  vscodeSchema,
  schemaRemoveAutoGenerated,
  schemaAddBareWorkflowDescription,
  schemaAddMarkdownDescription,
  schemaAddPatternErrorDescription,
} = require('../schema-expo-xdl');

describe('vscodeSchema', () => {
  // Snapshot testing to make sure nothing changed unexpectedly
  [39, 41, 45].forEach((sdkVersion) => {
    it(`creates expected SDK ${sdkVersion} schema`, () => {
      const xdlRespnse = require(`./__fixtures__/expo-xdl-${sdkVersion}.json`);
      const xdlSchema = xdlRespnse.data.schema; // the full response from exp.host
      const schema = vscodeSchema(`${sdkVersion}.0.0`, xdlSchema);
      expect(schema).toMatchSnapshot();
    });
  });

  it('returns schema wrapped in an expo object', () => {
    const xdlSchema = { description: 'All properties' };
    const schema = vscodeSchema('0.0.0', xdlSchema);
    expect(schema.properties.expo).to.equal(xdlSchema);
  });

  it('returns schema allowing additional root properties', () => {
    const xdlSchema = { description: 'All properties' };
    const schema = vscodeSchema('0.0.0', xdlSchema);
    expect(schema.additionalProperties).to.equal(true);
  });

  it('moves xdl definitions to root definitions', () => {
    const definitions = { android: { type: 'string' }, ios: { type: 'string' } };
    const xdlSchema = { description: 'All properties', definitions };
    const schema = vscodeSchema('0.0.0', xdlSchema);
    expect(schema.definitions).to.equal(definitions);
    expect(schema.properties.expo).not.to.have.property('definitions');
  });

  it('adds bare workflow description to markdownDescription', () => {
    const xdlSchema = { description: 'All properties', meta: { bareWorkflow: 'rich description' } };
    const schema = vscodeSchema('0.0.0', xdlSchema);
    expect(schema.properties.expo).to.have.property('markdownDescription');
    expect(schema.properties.expo.markdownDescription).to.contain(xdlSchema.description);
    expect(schema.properties.expo.markdownDescription).to.contain(xdlSchema.meta.bareWorkflow);
  });

  it('does not add auto-generated nested properties', () => {
    const xdlSchema = {
      description: 'All properties',
      properties: {
        normal: { type: 'string' },
        hidden: { type: 'string', meta: { autogenerated: true } },
      },
    };
    const schema = vscodeSchema('0.0.0', xdlSchema);
    expect(schema.properties.expo.properties).to.have.property('normal');
    expect(schema.properties.expo.properties).not.to.have.property('hidden');
  });
});

// Some usefull stubs to quickly create test schemas
const description = 'Some property';
const markdownDescription = 'Rich description';
const bareWorkflow = 'Only available in bare';
const autogenerated = true;

/** A test version of `vscodeSchema` to keep using the same API for jsonTraverse */
function testTraverse(schema, method) {
  jsonTraverse(
    schema,
    (nested, _nestedPath, _root, _parentPath, parentKey, parent, parentKeyIndex) => {
      method(nested, parent, parentKey, parentKeyIndex);
    }
  );
}

describe('schemaRemoveAutoGenerated', () => {
  it('skips autogenerated parents', () => {
    const schema = { description, meta: { autogenerated } };
    testTraverse(schema, schemaRemoveAutoGenerated);
    expect(Object.keys(schema)).to.have.length(2);
    expect(schema).to.containSubset({ description, meta: { autogenerated } });
  });

  it('skips non-autogenerated child property', () => {
    const child = { type: 'string' };
    const parent = { description, properties: { child } };
    testTraverse(parent, schemaRemoveAutoGenerated);
    expect(parent.properties.child).to.contain(child);
  });

  it('removed autogenerated child property', () => {
    const child = { type: 'string', meta: { autogenerated } };
    const parent = { description, properties: { child } };
    testTraverse(parent, schemaRemoveAutoGenerated);
    expect(parent.properties).not.to.have.property('child');
  });
});

describe('schemaAddBareWorkflowDescription', () => {
  const PREFIX = '\n\n**Bare workflow** - ';

  it('skips when meta.bareWorkflow does not exist', () => {
    const schema = { description };
    testTraverse(schema, schemaAddBareWorkflowDescription);
    expect(Object.keys(schema)).to.have.length(1);
    expect(schema.description).to.equal(description);
  });

  it('prepends meta.bareWorkflow with prefix to description', () => {
    const schema = { description, meta: { bareWorkflow } };
    testTraverse(schema, schemaAddBareWorkflowDescription);
    expect(schema.description).to.equal(`${description}${PREFIX}${bareWorkflow}`);
  });

  it('sets meta.bareWorkflow with prefix as description when not defined', () => {
    const schema = { meta: { bareWorkflow } };
    testTraverse(schema, schemaAddBareWorkflowDescription);
    expect(schema.description).to.equal(`${PREFIX}${bareWorkflow}`.trim()); // Trim should remove the two newlines
  });
});

describe('schemaAddMarkdownDescription', () => {
  it('skips when markdownDescription exists', () => {
    const schema = { description, markdownDescription };
    testTraverse(schema, schemaAddMarkdownDescription);
    expect(Object.keys(schema)).to.have.length(2);
  });

  it('skips when description does not exist', () => {
    const schema = { type: 'string' };
    testTraverse(schema, schemaAddMarkdownDescription);
    expect(schema).to.contain({ type: 'string' });
  });

  it('copies the description to markdownDescription', () => {
    const schema = { description };
    testTraverse(schema, schemaAddMarkdownDescription);
    expect(schema).to.have.property('markdownDescription', description);
  });
});

describe('schemaAddPatternErrorDescription', () => {
  it('skips when pattern is not set', () => {
    const schema = { description };
    testTraverse(schema, schemaAddPatternErrorDescription);
    expect(Object.keys(schema)).to.have.length(1);
  });

  it('skips when meta.regexHuman is not set', () => {
    const schema = { description, pattern: '^image/png$' };
    testTraverse(schema, schemaAddPatternErrorDescription);
    expect(Object.keys(schema)).to.have.length(2);
  });

  it('copies the meta.regexHuman to patternErrorMessage', () => {
    const schema = { description, pattern: '^image/png$', meta: { regexHuman: 'Better message' } };
    testTraverse(schema, schemaAddPatternErrorDescription);
    expect(schema.patternErrorMessage).to.equal(schema.meta.regexHuman);
  });
});
