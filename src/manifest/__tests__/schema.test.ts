import * as xdl from '@expo/xdl/build/project/ExpSchema';
import traverse, { TraverseCallback } from 'json-schema-traverse';

import * as tools from '../../../test/tools';
import * as schema from '../schema';

// note: this is the same value as `traverse`, but typed as mock
const mockedTraverse = (traverse as unknown) as jest.Mock<[object, TraverseCallback]>;

describe('getSchema', () => {
  it('fetches schema by expo sdk version', async () => {
    const xdlSchema = tools.getFixtureFile('schema-xdl-39.0.0.json');
    const spy = jest.spyOn(xdl, 'getSchemaAsync').mockResolvedValue(xdlSchema);

    expect(await schema.getSchema('39.0.0')).toBeDefined();
    expect(spy).toBeCalledWith('39.0.0');
  });
});

describe('createFromXdl', () => {
  const xdlSchema = tools.getFixtureFile('schema-xdl-39.0.0.json');
  const simpleSchema = tools.getFixtureFile('schema-plugin-39.0.0.json');
  const enhancedSchema = tools.getFixtureFile('schema-enhanced-39.0.0.json');

  it('creates enhanced plugin schema from xdl', () => {
    const createdSchema = schema.createFromXdl('39.0.0', xdlSchema);
    expect(createdSchema).toStrictEqual(expect.objectContaining(enhancedSchema));
  });

  it('uses simple plugin schema when failing to enhance', () => {
    mockedTraverse.mockImplementationOnce(() => {
      throw new Error('Failed traversing schema');
    });
    const createdSchema = schema.createFromXdl('39.0.0', xdlSchema);
    expect(createdSchema).toStrictEqual(expect.objectContaining(simpleSchema));
  });
});
