import type {
  resolveConfigPluginFunction,
  resolveConfigPluginFunctionWithInfo,
} from '@expo/config-plugins/build/utils/plugin-resolver';
import { findNodeAtLocation, getNodeValue, Node, Range } from 'jsonc-parser';

import { truthy } from '../utils/array';
import { resetModuleFrom } from '../utils/module';
import { loadExpoConfigPluginsResolver } from './packages';
import { ExpoProject } from './project';

export type PluginDefiniton = {
  nameValue: string;
  nameRange: Range;
};

export type PluginInfo = NonNullable<ReturnType<typeof resolveConfigPluginFunctionWithInfo>>;
export type PluginFunction = ReturnType<typeof resolveConfigPluginFunction>;

/**
 * Get the plugin definition from manifest node.
 * Both the `name` and it's `range` include the quotes.
 * This supports different plugin definitions:
 *   - `"plugins": ["./my-plguin.js"]`
 *   - `"plugins": ["expo-camera"]`
 *   - `"plugins": [["expo-camera", [...]]`
 */
export function getPluginDefinition(plugin: Node): PluginDefiniton {
  const name = plugin.children?.length ? plugin.children[0] : plugin;

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
 * Try to resolve the config plugin information.
 * This resets previously imported modules to reload this information.
 * When it fails to resolve the config plugin, undefined is returned.
 */
export function resolvePluginInfo(projectRoot: string, name: string): PluginInfo | undefined {
  resetModuleFrom(projectRoot, name);

  try {
    const { resolveConfigPluginFunctionWithInfo } = loadExpoConfigPluginsResolver(projectRoot);
    return resolveConfigPluginFunctionWithInfo(projectRoot, name);
  } catch {
    return undefined;
  }
}

/**
 * Try to resolve the actual config plugin function.
 * When it fails to resolve the config plugin, an error is thrown.
 */
export function resolvePluginFunctionUnsafe(projectRoot: string, name: string): PluginFunction {
  const { resolveConfigPluginFunction } = loadExpoConfigPluginsResolver(projectRoot);
  return resolveConfigPluginFunction(projectRoot, name);
}

/**
 * Resolve all installed plugin info from the project.
 * This uses the `package.json` to find all installed plugins.
 *
 * @todo Investigate potential issues with monorepos
 */
export function resolveInstalledPluginInfo(
  project: ExpoProject,
  search?: string,
  maxResults?: number
): PluginInfo[] {
  const dependenciesNode = findNodeAtLocation(project.package.tree, ['dependencies']);
  if (!dependenciesNode) {
    return [];
  }

  let dependencies = Object.keys(getNodeValue(dependenciesNode));

  if (search) dependencies = dependencies.filter((name) => name.startsWith(search));
  if (maxResults !== null) dependencies = dependencies.slice(0, maxResults);

  return dependencies.map((name) => resolvePluginInfo(project.root, name)).filter(truthy);
}
