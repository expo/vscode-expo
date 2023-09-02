import cp from 'child_process';

import { debug } from '../utils/debug';

const log = debug.extend('project');

/**
 * Execute an Expo CLI command using the `npx expo <command> <...argsOrFlags>` syntax.
 * This is useful to ask the project for data, like introspection.
 */
export function spawnExpoCli(
  command: string,
  argsOrFlags: string[],
  options: cp.ExecSyncOptions = {}
) {
  log(`Executing 'npx expo ${command} ${argsOrFlags.join(' ')}'`);

  const result = cp.spawnSync('npx', ['--no-install', 'expo', command, ...argsOrFlags], {
    ...options,
    env: {
      ...process.env,
      // Force the Expo CLI into non-interactive mode
      CI: 'true',
      // Keep the process as fast as possible, without waiting for external services
      EXPO_NO_TELEMETRY: 'true',
    },
  });

  log(`Received status ${result.status} from 'npx expo ${command} ${argsOrFlags.join(' ')}'`);

  if (result.error) {
    throw result.error;
  }

  return result.stdout.toString();
}
