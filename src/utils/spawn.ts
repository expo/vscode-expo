import spawnAsync from '@expo/spawn-async';

/** Re-export all important types */
export type { SpawnOptions, SpawnPromise, SpawnResult } from '@expo/spawn-async';

/** Re-export `spawnAsync` as a stub-able property */
export const spawn = spawnAsync;
