import { expect } from 'chai';

import { uniqueBy } from '../array';

describe('uniqueBy', () => {
  it('returns unique numbers', () => {
    expect([1, 2, 3, 3].filter(uniqueBy(String))).to.deep.equal([1, 2, 3]);
  });

  it('returns unique strings', () => {
    expect(['hello', 'world', 'hello'].filter(uniqueBy(String))).to.deep.equal(['hello', 'world']);
  });

  it('returns unique mixed values', () => {
    expect([1, 'hello', 2, 2, 'world', 'hello', 3].filter(uniqueBy(String))).to.deep.equal([
      1,
      'hello',
      2,
      'world',
      3,
    ]);
  });

  it('returns unique strings from objects', () => {
    const list = [
      { id: 1, name: 'hello' },
      { id: 2, name: 'world' },
      { id: 3, name: 'hello' },
    ];

    expect(list.filter(uniqueBy((item) => item.name))).to.deep.equal([
      { id: 1, name: 'hello' },
      { id: 2, name: 'world' },
    ]);
  });
});
