import { runTests } from '@vscode/test-electron';
import path from 'path';
import semver from 'semver';

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
    // Skip default vscode behaviors
    // '--skip-welcome',
    // '--skip-release-notes',
    // // Disable internal vscode limitations
    // '--disable-workspace-trust',
    // '--disable-extensions',
    // // '--disable-gpu',
    // // '--disable-gpu-sandbox',
    // // '--no-sandbox',
    // Load the fixtures as workspace
    path.resolve(rootDir, './test/fixture'),
  ],
  version: resolveVscodeVersion(),
  // Reporter is disabled in CI because it's super slow
  // reporter: process.env.CI ? new SilentReporter() : undefined,
})
  .then(() => console.log('✅ All tests passed!'))
  .catch((error) => {
    console.error('❌ Tests failed.');
    console.error(error);
    process.exit(1);
  });

/**
 * Resolve the vscode version from environment variable.
 * Whenever `oldest` is used, it uses the minimum supported version from `package.json`.
 */
function resolveVscodeVersion() {
  let version = process.env.VSCODE_VERSION;

  if (version === 'oldest') {
    const { engines } = require(path.resolve(rootDir, 'package.json'));
    version = String(semver.minVersion(engines.vscode));
  }

  if (!version) {
    throw new Error('VSCODE_VERSION is not defined');
  }

  return version;
}
