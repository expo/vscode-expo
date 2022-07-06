import { waitForExtension } from '../../src/__tests__/utils/vscode';

/**
 * Takes the Visual Studio Code extension API which was exposed on the sandbox's
 * global object and uses it to create a virtual mock. This replaces vscode
 * module imports with the vscode extension instance from the test runner's
 * environment.
 *
 * @see https://github.com/Unibeautify/vscode/blob/61897cd6cd0567db2c8688c3c0b835f9b5c5b446/test/jest-vscode-framework-setup.ts
 */
jest.mock('vscode', () => (global as any).vscode, { virtual: true });

/**
 * Add a global listener to wait for the extension to be activated.
 * Without this being ready, we can't test much.
 */
beforeAll(async () => {
  await waitForExtension();
});
