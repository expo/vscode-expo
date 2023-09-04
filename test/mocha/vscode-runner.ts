import 'mocha-chai-jest-snapshot';
import Chai from 'chai';
import { glob } from 'glob';
import Mocha from 'mocha';
import path from 'path';

export async function run() {
  // Configure the test runner
  const tests = new Mocha({
    timeout: 30_000,
    parallel: false,
    reporter: require('mocha-chai-jest-snapshot/reporters/spec'),
  });

  // Globally initialize the test environment
  tests.globalSetup(async function before() {
    // Show the snapshot configuration
    console.log(
      'Snapshot updates:',
      require('mocha-chai-jest-snapshot/dist/helper').snapshotOptions.updateSnapshot
    );

    // Configure Chai extensions
    Chai.use(require('chai-subset'));
    Chai.use(
      require('mocha-chai-jest-snapshot').jestSnapshotPlugin({
        snapshotResolver: path.resolve(__dirname, './snapshots'),
      })
    );

    // Wait until the extension is fully activated
    await require('../../src/__tests__/utils/vscode').waitForExtension();
  });

  // Find all test files
  let files = await glob('**/__tests__/**/*.{e2e,test}.{js,ts}', {
    // absolute: true, // Avoid using glob's absolute paths, Windows drive letters may be different cased
    cwd: path.resolve(__dirname, '../../src'),
    ignore: 'node_modules/**',
  });

  // Check for test pattern
  const testPattern = process.env.VSCODE_EXPO_TEST_PATTERN;

  // Resolve all test files that should be executed
  files = files
    .map((file) => path.resolve(__dirname, '../../src', file))
    .filter((file) => !testPattern || file.includes(testPattern));

  // Error when test pattern does not match any files
  if (!files.length) {
    throw new Error('No test files found.');
  } else {
    files.forEach((file) => tests.addFile(file));
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
