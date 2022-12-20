import assert from 'assert';
import { Node, parseTree, findNodeAtLocation } from 'jsonc-parser';

import { getPropertyNode } from '../json';

describe(getPropertyNode, () => {
  const fixture = parseTree(
    JSON.stringify({
      boolKey: true,
      arrayKey: ['item1', 'item2'],
      objectkey: {
        nestedKeyTest: 'value',
        nestedKeyHello: 'world',
        nestedKeyCount: 69,
      },
    })
  )!;

  it('returns property node from value node', () => {
    const value = findNodeAtLocation(fixture, ['objectkey', 'nestedKeyTest']);
    assert(value);
    expect(getPropertyNode(value)).toMatchObject({
      type: 'property',
      children: expect.arrayContaining([
        expect.objectContaining({ value: 'nestedKeyTest' }),
        expect.objectContaining({ value: 'value' }),
      ]),
    });
  });

  it('returns same property node from property node', () => {
    const value = findNodeAtLocation(fixture, ['boolKey']);
    assert(value?.parent);
    expect(getPropertyNode(value.parent)).toBe(value.parent);
  });

  it('returns null when node is not found', () => {
    const property: Node = { type: 'string', value: 'fake', offset: 0, length: 4 };
    expect(getPropertyNode(property)).toBeNull();
  });
});
