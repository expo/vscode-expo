import { Node, Range } from 'jsonc-parser';
import vscode from 'vscode';

export function getDocumentRange(document: vscode.TextDocument, range: Range): vscode.Range {
  return new vscode.Range(
    document.positionAt(range.offset),
    document.positionAt(range.offset + range.length)
  );
}

/**
 * The range for completion items seems the have a wrong offset and length.
 * Possibly due to the quotes not being counted in the range, but completion items expect it.
 * @todo figure out if this is true, and rename the method to reflect this fix.
 */
export function rangeForCompletion(range: Range): Range {
  return {
    offset: range.offset + 1,
    length: range.length - 2,
  };
}

/**
 * Get the paired JSON property or key node, using a value starting node.
 * This returns the parent node when:
 *   - type of `property`
 *   - type of `string` and have a parent of type `property`
 *
 * @example `{ "some": "value" }` where `some` is a key node
 */
export function getPropertyNode(node: Node) {
  if (node.type === 'property') {
    return node;
  }

  if (node.type === 'string' && node.parent?.type === 'property') {
    return node.parent;
  }

  return null;
}
