import { runCLI } from 'jest';

// note: this file is executed from `./out/test/jest`
const jestConfig = require('../../../jest.config');

export async function run() {
  const { results } = await runCLI({ ...jestConfig, runInBand: true }, [jestConfig.rootDir]);
  const failures = results.testResults.map((test) => test.failureMessage).filter(Boolean);

  if (failures.length > 0) {
    throw new Error(`${failures.length} failed tests`);
  }
}
