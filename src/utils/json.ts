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
 * Determine if the node is a JSON key node.
 * For that, the node must be either:
 *   - type of `property`
 *   - type of `string` and have a parent of type `property`
 *
 * @example `{ "some": "value" }` where `some` is a key node
 */
export function isKeyNode(node: Node) {
  if (node.type === 'property') {
    return true;
  }

  return (
    node.type === 'string' && node.parent?.type === 'property' && node.parent.children?.[0] === node
  );
}
