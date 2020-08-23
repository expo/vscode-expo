import { runCLI } from 'jest';

// note: this file is executed from `./out/test`
const jestConfig = require('../../jest.config');

export async function run() {
	const logger = (line: string) => {
    console.log(line);
    return true;
	};

  process.stdout.write = logger;
  process.stderr.write = logger;

	const { results } = await runCLI(jestConfig as any, [jestConfig.rootDir]);
	const failures = results.testResults
		.map(test => test.failureMessage)
		.filter(Boolean);

  if (failures.length > 0) {
    throw new Error(`${failures.length} failed tests`);
  }
}
