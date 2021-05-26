import { Node, ParseError, parseTree } from 'jsonc-parser';
import * as path from 'path';
import { TextDocument } from 'vscode';

let expoJsonCache: Record<string, Node> = {};

export const appJsonPattern = {
  scheme: 'file',
  // Match against app.json and app.config.json
  pattern: '**/*/app{,.config}.json',
  language: 'json',
};

export function isAppJson(document: TextDocument) {
  return document && ['app.json', 'app.config.json'].includes(path.basename(document.fileName));
}

export function parseExpoJson(text: string): { node: Node | undefined; errors: ParseError[] } {
  if (text in expoJsonCache) {
    return { node: expoJsonCache[text], errors: [] };
  }
  const errors: ParseError[] = [];
  function findUpExpoObject(node: Node | undefined): Node | undefined {
    if (node?.children) {
      for (const child of node.children) {
        if (
          child.type === 'property' &&
          child.children?.[0]?.value === 'expo' &&
          child.children?.[1]?.type === 'object'
        ) {
          return findUpExpoObject(child.children[1]);
        }
      }
    }
    return node;
  }
  // Ensure we get the expo object if it exists.
  const node = findUpExpoObject(parseTree(text, errors));
  if (node) {
    expoJsonCache = {
      [text]: node,
    };
  }
  return { node, errors };
}
