import { ConfigPlugin } from '@expo/config-plugins';
import {
  resolveConfigPluginFunction,
  resolveConfigPluginFunctionWithInfo,
} from '@expo/config-plugins/build/utils/plugin-resolver';
import { findNodeAtLocation, getNodeValue, Node, Range } from 'jsonc-parser';

import { filter } from '../utils/array';
import { getNodeValueRange } from '../utils/json';
import { resetModuleFrom } from '../utils/module';
import { ExpoProject } from './project';

export type PluginDefinition = {
  nameValue: string;
  nameRange: Range;
};

export type PluginInfo = NonNullable<ReturnType<typeof resolvePluginInfo>>;

/**
 * Get the plugin definition from manifest node.
 * Both the `name` and it's `range` include the quotes.
 * This supports different plugin definitions:
 *   - `"plugins": ["./my-plguin.js"]`     → name: ./my-plugin.js
 *   - `"plugins": ["expo-camera"]`        → name: expo-camera
 *   - `"plugins": [["expo-camera", ...]`  → name: expo-camera
 */
export function getPluginDefinition(node: Node): PluginDefinition {
  const name = node.children?.length ? node.children[0] : node;

  return {
    nameValue: name.value,
    nameRange: getNodeValueRange(name),
  };
}

/**
 * Get a map of the plugin definitions from manifest node.
 * This uses the plugin name or reference as key.
 */
export function getDefinedPlugins(node?: Node): Map<string, PluginDefinition> {
  const plugins = new Map<string, PluginDefinition>();

  for (const child of node?.children ?? []) {
    const plugin = getPluginDefinition(child);
    if (plugin) plugins.set(plugin.nameValue, plugin);
  }

  return plugins;
}

/**
 * Resolve the plugin file reference from the project root.
 * This will reset the node require cache before resolving.
 * When resolving the plugin fails, undefined is returned.
 */
export function resolvePluginInfo(root: string, name: string) {
  resetModuleFrom(root, name);

  try {
    return resolveConfigPluginFunctionWithInfo(root, name);
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

/**
 * Resolve all installed plugins from the package.json dependencies.
 */
export function resolvePackagePluginsInfo(project: ExpoProject): PluginInfo[] {
  const dependencies = findNodeAtLocation(project.package.tree, ['dependencies']);
  if (!dependencies) {
    return [];
  }

  return filter(
    Object.keys(getNodeValue(dependencies)).map((name) => resolvePluginInfo(project.root, name))
  );
}
