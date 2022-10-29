import {
  resolveConfigPluginFunction,
  resolveConfigPluginFunctionWithInfo,
} from '@expo/config-plugins/build/utils/plugin-resolver';
import { Node, Range } from 'jsonc-parser';
import { DocumentFilter } from 'vscode';

import { resetModuleFrom } from '../utils/module';

export type FileReference = {
  filePath: string;
  fileRange: Range;
};

type PluginDefiniton = {
  nameValue: string;
  nameRange: Range;
};

/**
 * Select documents matching `app.json` or `app.config.json`.
 * Note, language is set to JSONC instead of JSON(5) to enable comments.
 */
export const manifestPattern: DocumentFilter = {
  scheme: 'file',
  language: 'jsonc',
  pattern: '**/*/app{,.config}.json',
};

/**
 * Find all (sub)strings that might be a file path.
 * This returns all strings matching `"./"` or "../".
 */
export function getFileReferences(manifest: string): FileReference[] {
  const references = [];
  const matches = manifest.matchAll(/"(\.\.?\/.*)"/g);

  for (const match of matches) {
    if (!match.index) continue;

    references.push({
      filePath: match[1],
      fileRange: {
        // Match index starts at the first quote,
        // offset it by 1 character to exclude from range.
        offset: match.index + 1,
        length: match[1].length,
      },
    });
  }

  return references;
}

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
export function resolvePluginInfo(dir: string, name: string) {
  resetModuleFrom(dir, name);

  try {
    return resolveConfigPluginFunctionWithInfo(dir, name);
  } catch {
    return undefined;
  }
}

/**
 * Try to resolve the actual config plugin function.
 * When it fails to resolve the config plugin, an error is thrown.
 */
export function resolvePluginFunctionUnsafe(dir: string, name: string) {
  return resolveConfigPluginFunction(dir, name);
}
