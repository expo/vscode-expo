import { findNodeAtLocation, JSONPath, Node, parseTree, Range } from 'jsonc-parser';
import vscode from 'vscode';

export interface JsonFile {
  tree: Node;
  content: string;
}

export function parseJson(content: string, path?: JSONPath): JsonFile | undefined {
  let tree = parseTree(content);
  if (tree && path) {
    tree = findNodeAtLocation(tree, path);
  }

  return tree ? { tree, content } : undefined;
}

export function getDocumentRange(document: vscode.TextDocument, range: Range): vscode.Range {
  return new vscode.Range(
    document.positionAt(range.offset),
    document.positionAt(range.offset + range.length)
  );
}
