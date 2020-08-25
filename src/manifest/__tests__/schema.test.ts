import * as xdl from '@expo/xdl/build/project/ExpSchema';
import * as schema from '../schema';
import * as tools from '../../../test/tools';

describe('getSchema', () => {
	it('fetches schema by expo sdk version', async () => {
		const xdlSchema = tools.getFixtureFile('schema-xdl-39.0.0.json');
		const spy = jest.spyOn(xdl, 'getSchemaAsync')
			.mockResolvedValue(xdlSchema);

		expect(await schema.getSchema('39.0.0')).toBeDefined();
		expect(spy).toBeCalledWith('39.0.0');
	});
});

describe('createFromXdl', () => {
	const xdlSchema = tools.getFixtureFile('schema-xdl-39.0.0.json');
	// const simpleSchema = tools.getFixtureFile('schema-plugin-39.0.0.json');
	const enhancedSchema = tools.getFixtureFile('schema-enhanced-39.0.0.json');

	it('creates enhanced plugin schema from xdl', () => {
		const createdSchema = schema.createFromXdl('39.0.0', xdlSchema);
		expect(createdSchema).toStrictEqual(expect.objectContaining(enhancedSchema));
	});

	// todo: add test to validate it falls back to original schema
});
