import assert from 'assert';
import { findNodeAtLocation, JSONPath, Node, parseTree, Range } from 'jsonc-parser';
import vscode from 'vscode';

export interface JsonFile {
  tree: Node;
  content: string;
}

/**
 * Parse the given JSON file by it's content.
 * Optionally provide a JSON path to select as tree node.
 * When the custom tree node can't be found, undefined is returned.
 */
export function parseJson(content: string, path?: JSONPath): JsonFile | undefined {
  let tree = parseTree(content);
  if (tree && path) {
    tree = findNodeAtLocation(tree, path);
  }

  return tree ? { tree, content } : undefined;
}

/**
 * Get the "value range" of a `string` JSON Node.
 * This will remove the quotes from the range on both sides.
 */
export function getNodeValueRange(node: Node): Range {
  assert(node.type === 'string', `Expected a string node, received ${node.type}`);

  return {
    offset: node.offset + 1, // Account for the opening quote character
    length: node.value.length,
  };
}

/** Translate a JSON range to a vscode document range */
export function getDocumentRange(document: vscode.TextDocument, range: Range): vscode.Range {
  return new vscode.Range(
    document.positionAt(range.offset),
    document.positionAt(range.offset + range.length)
  );
}

/**
 * Determine if the JSON node is an object property key.
 * This is true when the type is `property`, or:
 *   - The node is a `string`
 *   - The parent node is a `property`
 *   - The node is the first child if it's parent
 */
export function isPropertyNode(node: Node) {
  if (node.type === 'property') {
    return true;
  }

  return (
    node.type === 'string' && node.parent?.type === 'property' && node.parent.children?.[0] === node
  );
}

/**
 * Find and return the JSON `string` node of a property.
 * It uses the provided node as starting point, often the value node of the property.
 */
export function findPropertyNode(node: Node) {
  if (node.parent && node.parent.type === 'property') {
    return node.parent.children?.[0];
  }
}
