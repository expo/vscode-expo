const chai = require('chai');
const { glob } = require('glob');
const Mocha = require('mocha');

async function run() {
  // Find all test files
  const files = await glob('**/__tests__/**/*.{e2e,test}.{js,ts}', {
    absolute: true,
    cwd: __dirname,
    ignore: 'node_modules/**',
  });

  if (!files.length) {
    throw new Error('No test files found');
  }

  // Configure the test runner
  const tests = new Mocha({
    reporter: require('mocha-chai-jest-snapshot/reporters/spec'),
  });

  // Globally initialize Chai extensions
  tests.globalSetup(() => {
    chai.use(require('chai-subset'));
    chai.use(require('mocha-chai-jest-snapshot').jestSnapshotPlugin());
  });

  // Add all tests
  for (const file of files) {
    tests.addFile(file);
  }

  // Execute the tests
  return new Promise((resolve, reject) => {
    tests.run((failures) => {
      if (failures === 0) {
        resolve();
      } else {
        reject(new Error(`${failures} out of ${files.length} failed tests`));
      }
    });
  });
}

run().then(() => console.log('✓ All tests passed!'));
