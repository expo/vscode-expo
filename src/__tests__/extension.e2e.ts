import vscode from 'vscode';
import * as tools from '../../test/tools';
import { SCHEMA_PROP, SCHEMA_NAME } from '../manifest/config';

// note: the delay for the extension activation might take 5 seconds
jest.setTimeout(10 * 1000);

beforeAll(async () => {
	await tools.waitForExtensionActivation();
});

it(`is activated on startup`, async () => {
	expect(tools.getExtension().isActive).toBeTruthy();
});

it('registers global json schema manifest', () => {
	const config = vscode.workspace.getConfiguration();
	const schemas = config.inspect<any[]>(SCHEMA_PROP)?.globalValue;
	const expo = schemas?.find(item => item.name === SCHEMA_NAME);

	expect(expo).toBeTruthy();
});
