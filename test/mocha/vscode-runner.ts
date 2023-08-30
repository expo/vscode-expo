import chai from 'chai';
import { glob } from 'glob';
import Mocha from 'mocha';
import path from 'path';

import { waitForExtension } from '../../src/__tests__/utils/vscode';

export async function run() {
  // Find all test files
  const files = await glob('**/__tests__/**/*.{e2e,test}.{js,ts}', {
    absolute: true,
    cwd: path.resolve(__dirname, '../../src'),
    ignore: 'node_modules/**',
  });

  // Configure the test runner
  const tests = new Mocha({
    reporter: require('mocha-chai-jest-snapshot/reporters/spec'),
  });

  // Globally initialize Chai extensions
  tests.globalSetup(() => {
    chai.use(require('chai-subset'));
    chai.use(
      require('mocha-chai-jest-snapshot').jestSnapshotPlugin({
        snapshotResolver: path.resolve(__dirname, './snapshots'),
      })
    );
  });

  // Add all tests
  for (const file of files) {
    tests.addFile(file);
  }

  // Wait until the extension is fully activated
  await waitForExtension();

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
