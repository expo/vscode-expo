const { expect, use } = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { createVscodeSchema, fetchWorkflowSchema } = require('../schema-eas-workflow');

use(sinonChai);

describe('createVscodeSchema', () => {
  it('adds root description', () => {
    const workflowSchema = { scheme: 'test' };
    const schema = createVscodeSchema(workflowSchema);
    expect(schema).to.have.property('description');
    expect(schema).to.have.property('markdownDescription');
  });
});

describe('fetchWorkflowSchema', () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub(globalThis, 'fetch');
  });
  afterEach(() => {
    fetchStub.restore();
  });

  it('fetches the schema from API', async () => {
    const mockSchema = {};
    fetchStub.resolves({
      ok: true,
      json: async () => ({ data: mockSchema }),
    });

    const schema = await fetchWorkflowSchema();
    expect(schema).to.deep.equal(mockSchema);
    expect(fetchStub).to.have.been.calledWith('https://api.expo.dev/v2/workflows/schema');
  });
});
