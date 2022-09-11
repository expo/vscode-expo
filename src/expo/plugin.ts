import { ConfigPlugin } from '@expo/config-plugins';
import {
  resolveConfigPluginFunction,
  resolveConfigPluginFunctionWithInfo,
} from '@expo/config-plugins/build/utils/plugin-resolver';
import { Node, Range } from 'jsonc-parser';

import { resetModuleFrom } from '../utils/module';

export type PluginDefiniton = {
  nameValue: string;
  nameRange: Range;
};

/**
 * Get the plugin definition from manifest node.
 * Both the `name` and it's `range` include the quotes.
 * This supports different plugin definitions:
 *   - `"plugins": ["./my-plguin.js"]`
 *   - `"plugins": ["expo-camera"]`
 *   - `"plugins": [["expo-camera", [...]]`
 */
export function getPluginDefinition(node: Node): PluginDefiniton {
  const name = node.children?.length ? node.children[0] : node;

  return {
    nameValue: name.value,
    nameRange: {
      // Exclude the quotes from the range
      offset: name.offset + 1,
      length: name.length - 2,
    },
  };
}

/**
 * Resolve the plugin file reference from the project root.
 * This will reset the node require cache before resolving.
 * When resolving the plugin fails, undefined is returned.
 */
export function resolvePluginFile(root: string, name: string): string | undefined {
  resetModuleFrom(root, name);

  try {
    return resolveConfigPluginFunctionWithInfo(root, name).pluginFile;
  } catch {
    return undefined;
  }
}

/**
 * Resolve the plugin from the project root.
 * This might throw for invalid config plugins.
 */
export function resolvePlugin(root: string, name: string): ConfigPlugin<unknown> {
  return resolveConfigPluginFunction(root, name);
}
