import { expect } from 'chai';
import { match } from 'sinon';

import { stubSpawn } from '../../__tests__/utils/spawn';
import { spawnExpoCli } from '../cli';

describe('spawnExpoCli', () => {
  it('executes spawn with `npx expo` command', async () => {
    using spawn = stubSpawn();

    await spawnExpoCli('whoami', ['--json'], { stdio: 'inherit' });

    expect(spawn).to.be.calledWith(
      'npx',
      match(['expo', 'whoami', '--json']),
      match({ stdio: 'inherit' })
    );
  });

  it('returns the output of spawned process', async () => {
    using _spawn = stubSpawn({ stdout: 'testuser' });

    expect(await spawnExpoCli('whoami')).to.equal('testuser');
  });

  it('forces expo in non-interactive mode', async () => {
    using spawn = stubSpawn();

    await spawnExpoCli('whoami');

    expect(spawn).to.be.calledWith(
      'npx',
      match(['expo', 'whoami']),
      match({ env: match({ CI: 'true' }) })
    );
  });

  it('forces expo without telemetry', async () => {
    using spawn = stubSpawn();

    await spawnExpoCli('whoami');

    expect(spawn).to.be.calledWith(
      'npx',
      match(['expo', 'whoami']),
      match({ env: match({ EXPO_NO_TELEMETRY: 'true' }) })
    );
  });
});
