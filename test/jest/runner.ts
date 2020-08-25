import { runCLI } from 'jest';

// note: this file is executed from `./out/test/jest`
const jestConfig = require('../../../jest.config');

export async function run() {
	const logger = (line: string) => {
		// note: process.std*.write doesn't add a newline,
		// console.log does so lets remove it from the output.
    console.log(line.trimRight());
    return true;
	};

  process.stdout.write = logger;
	process.stderr.write = logger;

	// fix: we always need to run in band for the internal vscode api
	// if not running in bad, `import 'vscode'` sporadically throws "cannot find module"
	const config = { ...jestConfig, runInBand: true };

	const { results } = await runCLI(config, [jestConfig.rootDir]);
	const failures = results.testResults
		.map(test => test.failureMessage)
		.filter(Boolean);

  if (failures.length > 0) {
    throw new Error(`${failures.length} failed tests`);
  }
}
