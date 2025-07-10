import spawnAsync from '@expo/spawn-async';
import {
  downloadAndUnzipVSCode,
  resolveCliArgsFromVSCodeExecutablePath,
  runTests,
} from '@vscode/test-electron';
import path from 'path';
import { env } from 'process';

import { extensionDependencies } from '../../package.json';

// This file is executed from `./out/test/mocha`
const rootDir = path.resolve(__dirname, '../../../');

prepareAndRunTests();

async function prepareAndRunTests() {
  // See: https://code.visualstudio.com/api/working-with-extensions/testing-extension#custom-setup-with-atvscodetestelectron
  const extensionDevelopmentPath = rootDir;
  const extensionTestsPath = path.resolve(rootDir, './out/test/mocha/vscode-runner.js');
  const vscodeExecutablePath = await downloadAndUnzipVSCode(env.VSCODE_VERSION);
  const [cliPath, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

  try {
    await spawnAsync(
      cliPath,
      args.concat(extensionDependencies.map((extensionId) => `--install-extension=${extensionId}`)),
      { stdio: 'inherit' }
    );
  } catch (error: any) {
    console.error(`❌ Dependency extensions failed to install.`);
    console.error(error);
    process.exit(1);
  }

  try {
    // Run the extension test
    await runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath,
      extensionTestsPath,
      extensionTestsEnv: {
        VSCODE_EXPO_DEBUG: 'vscode-expo*', // always enable the debugger
        VSCODE_EXPO_TELEMETRY_KEY: '', // always disable telemetry in tests
      },
      launchArgs: [path.resolve(rootDir, './test/fixture')],
    });

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Tests failed.');
    console.error(error);
    process.exit(1);
  }
}
