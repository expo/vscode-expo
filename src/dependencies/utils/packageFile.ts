import { findNodeAtLocation, getNodeValue, Node, parse, parseTree, Range } from 'jsonc-parser';

export type PackageFile = { tree: Node; data: any };

/** The package.json cache that keeps track of a single file */
let packageConfigCache: Record<string, PackageFile> = {};

export function getPackageConfig(content: string): PackageFile | undefined {
  if (content in packageConfigCache) {
    return packageConfigCache[content];
  }

  const tree = parseTree(content);
  const data = tree && parse(content);

  if (!tree || !data) {
    return undefined;
  }

  packageConfigCache = {
    [content]: { tree, data },
  };

  return { tree, data };
}

export function findDependencyVersion(
  packageFile: PackageFile,
  dependencyName: string
): string | undefined {
  for (const type of ['dependencies', 'peerDependencies', 'devDependencies']) {
    if (packageFile.data[type]?.[dependencyName]) {
      return packageFile.data[type][dependencyName];
    }
  }
}

export function getPackageDependencies(
  packageFile: PackageFile,
  dependencyType: 'dependencies' | 'devDependencies' | 'peerDependencies'
) {
  const block = findNodeAtLocation(packageFile.tree, [dependencyType]);
  if (!block?.children?.length) {
    return [];
  }

  return block.children.map((node) => {
    if (node.children?.length === 2) {
      return {
        nameNode: node.children[0],
        nameValue: getNodeValue(node.children[0]),
        versionNode: node.children[1],
        versionValue: getNodeValue(node.children[1]),
        versionRange: {
          offset: node.children[1].offset + 1, // Remove starting quote
          length: node.children[1].length - 2, // Remove ending quote
        },
      };
    }
  }) as [
    {
      nameNode: Node;
      nameValue: string;
      versionNode: Node;
      versionValue: string;
      versionRange: Range;
    }
  ];
}
