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
	it('created plugin schema from xdl schema', () => {
		const xdlSchema = tools.getFixtureFile('schema-xdl-39.0.0.json');
		const pluginSchema = tools.getFixtureFile('schema-plugin-39.0.0.json');
		const createdSchema = schema.createFromXdl('39.0.0', xdlSchema);

		expect(createdSchema).toMatchObject(pluginSchema);
	});
});
