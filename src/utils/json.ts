import { Node, Range } from 'jsonc-parser';
import vscode from 'vscode';

export function getDocumentRange(document: vscode.TextDocument, range: Range): vscode.Range {
  return new vscode.Range(
    document.positionAt(range.offset),
    document.positionAt(range.offset + range.length)
  );
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

/**
 * Find the JSON property string node, from a value node.
 * This searches the `parent.children` list and returns the first `string` node.
 */
export function findKeyStringNode(node: Node) {
  if (node.parent?.type !== 'property') {
    return null;
  }

  if (node.parent?.children?.[0].type === 'string') {
    return node.parent.children[0];
  }

  return null;
}
