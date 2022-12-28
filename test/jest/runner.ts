import { runCLI } from 'jest';
import { resolve } from 'path';

// This file is executed from `./out/test/jest`
const jestConfig = require('../../jest.vscode');

export async function run() {
  const config = {
    ...jestConfig,
    // Increase the timeout for our e2e tests
    testTimeout: 30000,
    // Force all tests to run in series
    runInBand: true,
    maxWorkers: 1,
    // Update snapshots if the vscode task is asking for it
    updateSnapshot: process.env['JEST_UPDATE_SNAPSHOTS'] === 'true',
    // Setup the custom vscode environment
    testEnvironment: resolve(jestConfig.rootDir, './out/test/jest/environment.js'),
    setupFilesAfterEnv: [
      resolve(jestConfig.rootDir, './out/test/jest/setup.js'),
      ...(jestConfig.setupFilesAfterEnv ?? []),
    ],
    snapshotResolver: resolve(jestConfig.rootDir, './out/test/jest/snapshots.js'),
    // Set the test pattern to run, if any
    testPathPattern: process.env['VSCODE_EXPO_TEST_PATTERN']
      ? [process.env['VSCODE_EXPO_TEST_PATTERN']]
      : undefined,
  };

  const { results } = await runCLI(config, [config.rootDir]);
  const failures = results.testResults.map((test) => test.failureMessage).filter(Boolean);

  if (failures.length > 0) {
    throw new Error(`${failures.length} failed tests`);
  }
}
