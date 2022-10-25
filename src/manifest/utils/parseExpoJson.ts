import { Node, ParseError, parseTree, findNodeAtLocation } from 'jsonc-parser';
import path from 'path';
import { TextDocument } from 'vscode';

let expoJsonCache: Record<string, Node> = {};

export const appJsonPattern = {
  scheme: 'file',
  // Match against app.json and app.config.json
  pattern: '**/*/app{,.config}.json',
  language: 'jsonc',
};

export function isAppJson(document: TextDocument) {
  return document && ['app.json', 'app.config.json'].includes(path.basename(document.fileName));
}

export function parseExpoJson(text: string): { node: Node | undefined; errors: ParseError[] } {
  if (text in expoJsonCache) {
    return { node: expoJsonCache[text], errors: [] };
  }

  const errors: ParseError[] = [];
  const tree = parseTree(text, errors);

  if (!tree) {
    return { errors, node: undefined };
  }

  const expo = findNodeAtLocation(tree, ['expo']);

  if (expo) {
    expoJsonCache = {
      [text]: expo,
    };
  }

  return { errors, node: expo };
}
