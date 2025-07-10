import { runTests } from '@vscode/test-electron';
import path from 'path';

// This file is executed from `./out/test/mocha`
const rootDir = path.resolve(__dirname, '../../../');

runTests({
  extensionDevelopmentPath: rootDir,
  extensionTestsPath: path.resolve(__dirname, './vscode-runner'),
  extensionTestsEnv: {
    VSCODE_EXPO_DEBUG: 'vscode-expo*', // always enable the debugger
    VSCODE_EXPO_TELEMETRY_KEY: '', // always disable telemetry in tests
  },
  launchArgs: [path.resolve(rootDir, './test/fixture')],
  version: process.env.VSCODE_VERSION,
})
  .then(() => console.log('✅ All tests passed!'))
  .catch((error) => {
    console.error('❌ Some tests failed.');
    console.error(error);
    process.exit(1);
  });
