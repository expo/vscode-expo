import {
  resolveConfigPluginFunction,
  resolveConfigPluginFunctionWithInfo,
} from '@expo/config-plugins/build/utils/plugin-resolver';
import { Node } from 'jsonc-parser';

import { createDebug } from '../debug';

const log = createDebug('plugins');

/**
 * Get the plugin name from manifest node.
 * Both the `name` and `range` include the quotes.
 * This supports different plugin definitions:
 *   - `"plugins": ["./my-plguin.js"]`
 *   - `"plugins": ["expo-camera"]`
 *   - `"plugins": [["expo-camera", [...]]`
 */
export function getPluginName(node: Node) {
  const name = node.children?.length ? node.children[0] : node;

  return {
    name: name.value,
    range: {
      // Exclude the quotes from the range
      offset: name.offset + 1,
      length: name.length - 2,
    },
  };
}

export function resolvePluginFile(root: string, name: string): string | undefined {
  try {
    const plugin = resolveConfigPluginFunctionWithInfo(root, name);
    log('Resolved plugin %s in %s', name, root);
    return plugin.pluginFile;
  } catch {
    log('Failed resolving plugin %s in %s', name, root);
    return undefined;
  }
}
