import { findNodeAtLocation, Node } from 'jsonc-parser';
import { Position, Range, TextDocument } from 'vscode';

import { parseExpoJson } from './parseExpoJson';

export interface JsonRange {
  offset: number;
  length: number;
}

export interface PluginRange {
  nameValue: string;
  /**
   * If the plugin is using an array with a single item in it (i.e. no props), then the user should be warned.
   * If the plugin has more than two items then it's invalid and the user should be warned in advance.
   */
  arrayLength?: number;
  name: JsonRange;
  full?: JsonRange;
  props?: JsonRange;
}

export function findPluginsNode(appJson: Node | undefined) {
  return appJson ? findNodeAtLocation(appJson, ['plugins']) : null;
}

function iteratePlugins(appJson: Node | undefined, iterator: (node: Node) => void) {
  const pluginsNode = findPluginsNode(appJson);

  if (pluginsNode?.children) {
    pluginsNode.children.forEach(iterator);
  }
}

export function iteratePluginNames(
  appJson: Node | undefined,
  iterator: (resolver: PluginRange, node: Node) => void
) {
  iteratePlugins(appJson, (node) => {
    let resolver = getPluginResolver(node);
    if (resolver) {
      resolver.full = node;
      iterator(resolver, node);
    } else if (node.type === 'array' && node.children?.length) {
      resolver = getPluginResolver(node.children[0]);
      if (!resolver) return;
      resolver.full = node;
      const props = node.children[1];

      resolver.arrayLength = node.children.length;
      // Tested against objects as props
      if (props) {
        resolver.props = {
          offset: props.offset,
          length: props.length,
        };
      }

      iterator(resolver, node);
    }
  });
}

function getPluginResolver(child?: Node): PluginRange | null {
  if (child?.type === 'string') {
    return {
      nameValue: child.value,
      name: {
        offset: child.offset,
        length: child.length,
      },
    };
  }
  return null;
}

export function rangeForOffset(document: TextDocument, source: JsonRange) {
  return new Range(
    document.positionAt(source.offset),
    document.positionAt(source.offset + source.length)
  );
}
export function rangeForQuotedOffset(document: TextDocument, source: JsonRange) {
  // For nodes that have quotes
  return new Range(
    document.positionAt(source.offset + 1),
    document.positionAt(source.offset + (source.length - 1))
  );
}

export function parseSourceRanges(text: string): { appJson?: Node; plugins: PluginRange[] } {
  const definedPlugins: PluginRange[] = [];
  // Ensure we get the expo object if it exists.
  const { node } = parseExpoJson(text);

  iteratePluginNames(node, (resolver) => {
    definedPlugins.push(resolver);
  });

  return { appJson: node, plugins: definedPlugins };
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
