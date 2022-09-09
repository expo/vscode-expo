import { findNodeAtLocation, Node, Range } from 'jsonc-parser';
import { DocumentLink, TextDocument, Uri } from 'vscode';

import { getDocumentRange, JsonFile } from '../json';

export function findManifestPlugins(manifest: JsonFile): Node | undefined {
  return findNodeAtLocation(manifest.tree, ['plugins']);
}

export function findManifestFileReferences(manifest: JsonFile) {
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

export function createManifestFileLink(document: TextDocument, range: Range, file: string) {
  return new DocumentLink(getDocumentRange(document, range), Uri.file(file));
}
