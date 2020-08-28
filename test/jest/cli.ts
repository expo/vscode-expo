import path from 'path';
import { runTests } from 'vscode-test';

runTests({
  // note: this file is executed from `./out/test/jest`
  extensionDevelopmentPath: path.resolve(__dirname, '../../../'),
  extensionTestsPath: path.resolve(__dirname, './runner'),
  launchArgs: ['--disable-extensions'],
  version: process.env.VSCODE_VERSION,
})
  .then(() => console.log('✅ All tests passed!'))
  .catch((error) => {
    console.error('❌ Some tests failed.');
    console.error(error);
    process.exit(1);
  });
