import 'mocha-chai-jest-snapshot';
import Chai from 'chai';
import { glob } from 'glob';
import Mocha from 'mocha';
import path from 'path';

// This temporary workaround for Windows avoids the missing Chai extension error
// Somehow, on Windows, the Chai library gets fully reloaded and loses its extensions
declare global {
  const expect: Chai.ExpectStatic;
}

export async function run() {
  // Configure the test runner
  const tests = new Mocha({
    timeout: 5_000,
    reporter: require('mocha-chai-jest-snapshot/reporters/spec'),
  });

  // Globally initialize the test environment
  tests.globalSetup(async function before() {
    // Configure Chai extensions
    Chai.use(require('chai-subset'));
    Chai.use(
      require('mocha-chai-jest-snapshot').jestSnapshotPlugin({
        snapshotResolver: path.resolve(__dirname, './snapshots'),
      })
    );

    // @ts-ignore
    global.expect = Chai.expect;

    // Wait until the extension is fully activated
    await require('../../src/__tests__/utils/vscode').waitForExtension();
  });

  // Find all test files
  const files = await glob('**/__tests__/**/*.{e2e,test}.{js,ts}', {
    absolute: true,
    cwd: path.resolve(__dirname, '../../src'),
    ignore: 'node_modules/**',
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
