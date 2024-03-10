import { type SinonStub } from 'sinon';

import { disposedStub } from './sinon';
import * as spawn from '../../utils/spawn';

/** Mock spawn with a default empty device list response */
export function stubSpawn(result?: Partial<spawn.SpawnResult>) {
  return withSpawnResult(disposedStub(spawn, 'spawn'), result);
}

export function withSpawnResult<T extends SinonStub>(
  spawnStub: T,
  result: Partial<spawn.SpawnResult> = {}
) {
  spawnStub.returns(Promise.resolve(result));
  return spawnStub;
}
