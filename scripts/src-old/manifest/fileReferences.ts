import { Node } from 'jsonc-parser';
import { Range, TextDocument } from 'vscode';

import { findPluginsNode, rangeForOffset } from './utils/iteratePlugins';

function rangeForMatch(document: TextDocument, match: { index: number; length: number }) {
  return new Range(
    document.positionAt(match.index),
    document.positionAt(match.index + match.length)
  );
}

export function iterateFileReferences(
  document: TextDocument,
  node: Node | undefined,
  callback: (props: { fileReference: string; range: Range; match: RegExpMatchArray }) => void
) {
  const pluginsNode = findPluginsNode(node);
  const pluginsRange = pluginsNode ? rangeForOffset(document, pluginsNode) : null;

  const matches = document.getText().matchAll(/"(\.\/.*)"/g);
  for (const match of matches) {
    if (match.index == null) {
      continue;
    }
    const [, fileReference] = match;
    const range = rangeForMatch(document, {
      // index includes the quotes, so move it by 1 to exclude the first quote
      index: match.index + 1,
      length: fileReference.length,
    });
    // Avoid matching against file imports that are inside of the plugins object.
    // Otherwise a plugin like `./my-plugin` would overwrite the better link we already created.
    if (pluginsRange && pluginsRange.contains(range)) {
      continue;
    }
    callback({ fileReference, range, match });
  }
}
