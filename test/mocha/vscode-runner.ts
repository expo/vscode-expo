import 'mocha-chai-jest-snapshot';
import Chai from 'chai';
import { glob } from 'glob';
import Mocha from 'mocha';
import path from 'path';

export async function run() {
  // Configure the test runner
  const tests = new Mocha({
    timeout: 5_000,
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
  const files = await glob('**/__tests__/**/*.{e2e,test}.{js,ts}', {
    // absolute: true, // Avoid using glob's absolute paths, Windows drive letters may be different cased
    cwd: path.resolve(__dirname, '../../src'),
    ignore: 'node_modules/**',
  });

  // Check for test pattern
  const testPattern = process.env.VSCODE_EXPO_TEST_PATTERN;

  // Add all tests, or only the ones matching the pattern
  files
    .map((file) => path.resolve(__dirname, '../../src', file))
    .forEach((file) => {
      if (!testPattern || file.includes(testPattern)) {
        tests.addFile(file);
      }
    });

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
