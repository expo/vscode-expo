import spawnAsync, { SpawnOptions } from '@expo/spawn-async';

/**
 * Execute an Expo CLI command using the `npx expo <command> <...argsOrFlags>` syntax.
 * This is useful to ask the project for data, like introspection.
 */
export async function spawnExpoCli(command: string, argsOrFlags: string[], options: SpawnOptions) {
  const result = await spawnAsync('npx', ['expo', command, ...argsOrFlags], {
    ...options,
    env: {
      ...process.env,
      CI: 'true', // Force Expo CLI into non-interactive mode
      EXPO_NO_TELEMETRY: 'true', // Don't wait for external services, reducing process time
    },
  });

  return result.stdout;
}

/**
 * Execute an Expo CLI command using the `npx expo <command> <...argsOrFlags>` syntax.
 * This is useful to ask the project for data, like introspection.
 */
// export function oldSpawnExpoCli(
//   command: string,
//   argsOrFlags: string[],
//   options: cp.ExecSyncOptions = {}
// ) {
//   const result = cp.spawnSync('npx', ['expo', command, ...argsOrFlags], {
//     ...options,
//     env: {
//       ...process.env,
//       CI: 'true', // Force Expo CLI into non-interactive mode
//       EXPO_NO_TELEMETRY: 'true', // Don't wait for external services, reducing process time
//     },
//   });

//   if (result.error) {
//     throw result.error;
//   }

//   return result.stdout.toString();
// }
