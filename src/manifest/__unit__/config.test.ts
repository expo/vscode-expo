import vscode from 'vscode';
import * as config from '../config';

it('exports global config schema property and name', () => {
	expect(config.SCHEMA_PROP).toBe('json.schemas');
	expect(config.SCHEMA_NAME).toBe('vscode-expo-manifest');
});

describe('registerGlobalSchema', () => {
	it('registers global json schema', async () => {
		const stub = stubConfiguration();
		const uri = vscode.Uri.file('path/to/file');

		jest.spyOn(vscode.workspace, 'getConfiguration')
			.mockReturnValue(stub);

		await config.registerGlobalSchema(uri);

		expect(stub.update).toBeCalledWith(config.SCHEMA_PROP, expect.any(Array), vscode.ConfigurationTarget.Global);
		expect(stub.update.mock.calls[0][1][0]).toMatchObject({
			name: config.SCHEMA_NAME,
			url: uri.toString(),
			fileMatch: expect.arrayContaining([
				'app.json',
				'app.config.json',
			])
		});
	});
});

describe('unregisterGlobalSchema', () => {
	it('registers global json schema', async () => {
		const stub = stubConfiguration();
		stub.inspect.mockReturnValue({
			schemas: {
				globalValue: [{ name: config.SCHEMA_NAME, uri: 'shouldnt/exist' }],
			},
		});

		jest.spyOn(vscode.workspace, 'getConfiguration')
			.mockReturnValue(stub);

		await config.unregisterGlobalSchema();

		expect(stub.update).toBeCalledWith(
			config.SCHEMA_PROP,
			[],
			vscode.ConfigurationTarget.Global,
		);
	});
});

function stubConfiguration() {
	return {
		get: jest.fn(),
		has: jest.fn(),
		inspect: jest.fn(),
		update: jest.fn(),
	};
}
