import { findNodeAtLocation, Node, Range } from 'jsonc-parser';

import { JsonFile } from '../utils/json';

export function findManifestPlugins(manifest: JsonFile): Node | undefined {
  return findNodeAtLocation(manifest.tree, ['plugins']);
}

export function findManifestFileReferences(manifest: JsonFile): { file: string; range: Range }[] {
  const references = [];
  const matches = manifest.content.matchAll(/"(\.\/.*)"/g);

  for (const match of matches) {
    if (!match.index) continue;

    references.push({
      file: match[1],
      range: {
        // Match index starts at the first quote,
        // offset it by 1 character to exclude from range.
        offset: match.index + 1,
        length: match[1].length,
      },
    });
  }

  return references;
}
