import { Node } from 'jsonc-parser';

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

function iteratePlugins(appJson: Node | undefined, iterator: (node: Node) => void) {
  let pluginsNode: Node | undefined;
  if (appJson?.children) {
    for (const child of appJson.children) {
      const children = child.children;
      if (children) {
        if (children && children.length === 2 && isPlugins(children[0].value)) {
          pluginsNode = children[1];
          break;
        }
      }
    }
  }

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

export function parseSourceRanges(text: string): PluginRange[] {
  const definedPlugins: PluginRange[] = [];
  // Ensure we get the expo object if it exists.
  const { node } = parseExpoJson(text);

  iteratePluginNames(node, (resolver) => {
    definedPlugins.push(resolver);
  });

  return definedPlugins;
}

function isPlugins(value: string) {
  return value === 'plugins';
}
