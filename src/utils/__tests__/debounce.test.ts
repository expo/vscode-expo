import { expect } from 'chai';
import { fake } from 'sinon';

import { waitFor } from '../../__tests__/utils/wait';
import { debounce } from '../debounce';

describe('debounce', () => {
  it('executes function after debounce delay', async () => {
    const mock = fake();
    const debounced = debounce(mock, 10);

    debounced();
    await waitFor(10);

    expect(mock).to.have.property('calledOnce', true);
  });

  it('delays execution after multiple calls', async () => {
    const mock = fake();
    const debounced = debounce(mock, 10);

    debounced();
    debounced();
    debounced();
    await waitFor(10);

    expect(mock).to.have.property('calledOnce', true);
  });

  it('uses the provided arguments', async () => {
    const mock = fake((name: string) => `hello ${name}`);
    const debounced = debounce(mock, 10);

    debounced('world');
    await waitFor(10);

    expect(mock).to.have.property('calledOnce', true);
    expect(mock.args[0]).to.deep.include('world');
  });

  it('uses the provided arguments of last delayed call', async () => {
    const mock = fake((name: string) => `hello ${name}`);
    const debounced = debounce(mock, 10);

    debounced('moon');
    debounced('earth');
    debounced('world');
    await waitFor(10);

    expect(mock).to.have.property('calledOnce', true);
    expect(mock.args[0]).to.deep.include('world');
  });
});
