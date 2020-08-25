import vscode from 'vscode';
import * as extension from '../extension';
import * as manifest from '../manifest';

describe('activate', () => {
	const stubContext: any = {
		globalStoragePath: 'path',
	};

	it('activates global manifest schema', async () => {
		const manifestSpy = jest.spyOn(manifest, 'activateGlobalSchema').mockResolvedValue();
		await extension.activate(stubContext);
		expect(manifestSpy).toBeCalledWith(stubContext);
	});

	it('shows error when activating global manifest schema fails', async () => {
		const error = new Error('Failed to register new manifest');
		const windowSpy = jest.spyOn(vscode.window, 'showErrorMessage').mockResolvedValue(undefined);
		jest.spyOn(manifest, 'activateGlobalSchema').mockRejectedValue(error);
		await extension.activate(stubContext);
		expect(windowSpy).toBeCalledWith(expect.stringContaining(error.message));
	});
});

describe('deactivate', () => {
	it('deactivates global manifest schema', async () => {
		const manifestSpy = jest.spyOn(manifest, 'deactivateGlobalSchema').mockResolvedValue();
		await extension.deactivate();
		expect(manifestSpy).toBeCalled();
	});

	it('shows error when deactivating global manifest schema fails', async () => {
		const error = new Error('Failed to unregister new manifest');
		const windowSpy = jest.spyOn(vscode.window, 'showErrorMessage').mockResolvedValue(undefined);
		jest.spyOn(manifest, 'deactivateGlobalSchema').mockRejectedValue(error);
		await extension.deactivate();
		expect(windowSpy).toBeCalledWith(expect.stringContaining(error.message));
	});
});
