import { glob } from 'glob';
import Mocha from 'mocha';
import path from 'path';

export async function run() {
  // Find all test files
  const files = await glob('**/__tests__/**/*.{e2e,test}.{js,ts}', {
    absolute: true,
    cwd: path.resolve(__dirname, '../../src'),
    ignore: 'node_modules/**',
  });

  // Configure the test runner
  const tests = new Mocha({
    timeout: 5_000,
    reporter: require('mocha-chai-jest-snapshot/reporters/spec'),
  });

  // Globally initialize the test environment
  tests.globalSetup(async () => {
    require('./setup');

    // Wait until the extension is fully activated
    await require('../../src/__tests__/utils/vscode').waitForExtension();
  });

  // Add all tests
  for (const file of files) {
    tests.addFile(file);
  }

  // Execute the tests
  return new Promise<void>((resolve, reject) => {
    tests.run((failures) => {
      if (failures === 0) {
        resolve();
      } else {
        reject(new Error(`${failures} out of ${files.length} failed tests`));
      }
    });
  });
}
