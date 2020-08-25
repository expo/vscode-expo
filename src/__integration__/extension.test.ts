import vscode from 'vscode';
import * as tools from '../../test/tools';
import { SCHEMA_PROP, SCHEMA_NAME } from '../manifest/config';

// note: when starting these tests, vscode is already up and running
it(`is activated on startup`, () => {
	expect(tools.getExtension().isActive).toBeTruthy();
});

it('registers global json schema manifest', () => {
	const config = vscode.workspace.getConfiguration();
	const schemas = config.inspect<any[]>(SCHEMA_PROP)?.globalValue;
	const expo = schemas?.find(item => item.name === SCHEMA_NAME);

	expect(expo).toBeTruthy();
});
