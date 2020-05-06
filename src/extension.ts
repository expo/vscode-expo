import * as vscode from 'vscode';
import * as Manifest from './manifest';

export async function activate(context: vscode.ExtensionContext) {
	try {
		await Manifest.activateGlobalSchema(context);
	} catch (error) {
		vscode.window.showErrorMessage(`Oops, looks like we couldn't activate the Expo manifest tools: ${error.message}`);
	}
}

export async function deactivate() {
	try {
		await Manifest.deactivateGlobalSchema();
	} catch (error) {
		vscode.window.showErrorMessage(`Oops, looks like we couldn't deactivate the Expo manifest tools: ${error.message}`);
	}
}
