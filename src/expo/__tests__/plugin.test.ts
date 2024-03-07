import { expect } from 'chai';
import { findNodeAtLocation, parseTree } from 'jsonc-parser';

import { type ExpoConfig } from '../../packages/config';
import { getPluginDefinition } from '../plugin';

const manifest: ExpoConfig = {
  name: 'test-app',
  slug: 'test-app',
  plugins: [
    'expo-plugin',
    ['expo-plugin-list'],
    ['expo-plugin-properties', { some: 'property' }],
    './plugins/local-plugin.js',
    ['./plugins/local-plugin-list.js'],
    ['./plugins/local-plugin-properties.js', { some: 'property' }],
  ],
};

describe('getPluginDefinition', () => {
  it('returns all plugin definitions from parsed manifest', () => {
    const json = parseTree(JSON.stringify({ expo: manifest }, null, 2))!;
    const plugins = findNodeAtLocation(json, ['expo', 'plugins'])!;

    expect(plugins.children).to.have.length(6); // manifest.plugins.length
    expect(plugins.children?.map((plugin) => getPluginDefinition(plugin))).to.deep.include.members([
      { nameValue: 'expo-plugin', nameRange: { length: 11, offset: 86 } },
      { nameValue: 'expo-plugin-list', nameRange: { length: 16, offset: 117 } },
      { nameValue: 'expo-plugin-properties', nameRange: { length: 22, offset: 161 } },
      { nameValue: './plugins/local-plugin.js', nameRange: { length: 25, offset: 251 } },
      { nameValue: './plugins/local-plugin-list.js', nameRange: { length: 30, offset: 296 } },
      { nameValue: './plugins/local-plugin-properties.js', nameRange: { length: 36, offset: 354 } },
    ]);
  });
});
