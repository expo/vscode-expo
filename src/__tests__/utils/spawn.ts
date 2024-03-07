import { stub, type SinonStub } from 'sinon';

import * as spawn from '../../utils/spawn';

/** Mock spawn with a default empty device list response */
export function stubSpawn(result?: Partial<spawn.SpawnResult>) {
  const spawnStub = withSpawnResult(stub(spawn, 'spawn'), result);
  // @ts-expect-error
  spawnStub[Symbol.dispose] = () => spawnStub.restore();
  return spawnStub as Disposable & typeof spawnStub;
}

export function withSpawnResult<T extends SinonStub>(
  spawnStub: T,
  result: Partial<spawn.SpawnResult> = {}
) {
  spawnStub.returns(Promise.resolve(result));
  return spawnStub;
}
