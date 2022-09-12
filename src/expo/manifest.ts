import { findNodeAtLocation, Node, Range } from 'jsonc-parser';
import { DocumentFilter } from 'vscode';

import { JsonFile } from '../utils/json';

export type FileReferenceDefinition = {
  filePath: string;
  fileRange: Range;
};

/** File names that are considered to be Expo app manifests */
export const manifestFiles = ['app.json', 'app.config.json'];

/** Select documents matching `app.json` or `app.config.json` */
export const manifestPattern: DocumentFilter = {
  scheme: 'file',
  language: 'json',
  pattern: '**/*/app{,.config}.json',
};

export function findManifestPlugins(manifest: JsonFile): Node | undefined {
  return findNodeAtLocation(manifest.tree, ['plugins']);
}

/**
 * Find all strings that might be a file path.
 * This returns all strings matching `"./"` or "../", including plugins.
 */
export function findManifestFileReferences(manifest: JsonFile): FileReferenceDefinition[] {
  const references = [];
  const matches = manifest.content.matchAll(/"(\.\.?\/.*)"/g);

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
 * Estimate if the manifest property is likely an image.
 * This uses the property name without the quotes.
 *
 * @todo use the actual XDL manifest for this instead of "estimate"
 */
export function isManifestPropertyImage(name: string): boolean {
  return /^((?:x?x?x?(?:h|m)dpi)|(tablet|foreground|background)?[iI]mage|(?:fav)?icon)/.test(name);
}
