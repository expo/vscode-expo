import { resolveConfigPluginFunctionWithInfo } from '@expo/config-plugins/build/utils/plugin-resolver';
import { Node } from 'jsonc-parser';

import { resetModuleFrom } from '../utils/module';

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

/**
 * Resolve the file path for a plugin.
 * This will reset the node require cache before resolving.
 */
export function resolvePluginFile(root: string, name: string): string | undefined {
  resetModuleFrom(root, name);

  try {
    return resolveConfigPluginFunctionWithInfo(root, name).pluginFile;
  } catch {
    return undefined;
  }
}
