import { findNodeAtLocation, getNodeValue, JSONPath, Node, Range } from 'jsonc-parser';
import vscode from 'vscode';

/**
 * Find the node at the given path and return it's value.
 * When the node is not found, it returns `undefined`.
 */
export function findNodeValueAtLocation<T = any>(node: Node, path: JSONPath): T | undefined {
  const target = findNodeAtLocation(node, path);
  return target ? getNodeValue(target) : undefined;
}

export function getDocumentRange(document: vscode.TextDocument, range: Range): vscode.Range {
  return new vscode.Range(
    document.positionAt(range.offset),
    document.positionAt(range.offset + range.length)
  );
}
