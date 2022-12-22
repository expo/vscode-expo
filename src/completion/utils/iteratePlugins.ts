import { findNodeAtLocation, Node } from 'jsonc-parser';
import { Position, Range, TextDocument } from 'vscode';

import { parseExpoJson } from './parseExpoJson';

export interface JsonRange {
  offset: number;
  length: number;
}

export function findPluginsNode(appJson: Node | undefined) {
  return appJson ? findNodeAtLocation(appJson, ['plugins']) : null;
}

export function rangeForOffset(document: TextDocument, source: JsonRange) {
  return new Range(
    document.positionAt(source.offset),
    document.positionAt(source.offset + source.length)
  );
}

export function positionIsInPlugins(document: TextDocument, position: Position) {
  const { node } = parseExpoJson(document.getText());
  const pluginsNode = findPluginsNode(node);
  if (pluginsNode) {
    const range = rangeForOffset(document, pluginsNode);
    return range.contains(position);
  }

  return false;
}
