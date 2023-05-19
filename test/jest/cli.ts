import { runTests, SilentReporter } from '@vscode/test-electron';
import path from 'path';

// This file is executed from `./out/test/jest`
const rootDir = path.resolve(__dirname, '../../../');

runTests({
  extensionDevelopmentPath: rootDir,
  extensionTestsPath: path.resolve(__dirname, './runner'),
  extensionTestsEnv: {
    VSCODE_EXPO_DEBUG: 'vscode-expo*', // always enable the debugger
    VSCODE_EXPO_TELEMETRY_KEY: '', // always disable telemetry in tests
  },
  launchArgs: [
    '--disable-extensions',
    '--disable-gpu',
    '--disable-workspace-trust',
    '--no-xshm',
    path.resolve(rootDir, './test/fixture'),
  ],
  version: process.env.VSCODE_VERSION,
  // Reporter is disabled in CI because it's super slow
  reporter: process.env.CI ? new SilentReporter() : undefined,
})
  .then(() => console.log('✅ All tests passed!'))
  .catch((error) => {
    console.error('❌ Some tests failed.');
    console.error(error);
    process.exit(1);
  });
