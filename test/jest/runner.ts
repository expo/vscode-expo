import { runCLI } from 'jest';

// note: this file is executed from `./out/test/jest`
const jestConfig = require('../../../jest.config');

export async function run() {
  process.stderr.write = (line: string) => {
    // note: process.std*.write doesn't add a newline,
    // console.log does, so lets remove it from the output.
    console.log(line.replace(/^[\r\n]+|[\r\n]+$/g, ''));
    return true;
  };

  const { results } = await runCLI({ ...jestConfig, runInBand: true }, [jestConfig.rootDir]);
  const failures = results.testResults.map((test) => test.failureMessage).filter(Boolean);

  if (failures.length > 0) {
    throw new Error(`${failures.length} failed tests`);
  }
}
