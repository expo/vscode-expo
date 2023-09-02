import cp from 'child_process';

/**
 * Execute an Expo CLI command using the `npx expo <command> <...argsOrFlags>` syntax.
 * This is useful to ask the project for data, like introspection.
 */
export function spawnExpoCli(
  command: string,
  argsOrFlags: string[],
  options: cp.ExecSyncOptions = {}
) {
  const result = cp.spawnSync('npx', ['expo', command, ...argsOrFlags], {
    ...options,
    env: {
      ...process.env,
      // Force the Expo CLI into non-interactive mode
      // CI: 'true',
      // Keep the process as fast as possible, without waiting for external services
      // EXPO_NO_TELEMETRY: 'true',
    },
  });

  if (result.error) {
    throw result.error;
  }

  return result.stdout.toString();
}
