import parentModule from 'parent-module';
import * as path from 'path';
import resolveFrom from 'resolve-from';

const resolve = (moduleId: string) => {
  try {
    return resolveFrom(path.dirname(parentModule(__filename)!), moduleId);
  } catch {}
};

const clear = (moduleId: string) => {
  if (typeof moduleId !== 'string') {
    throw new TypeError(`Expected a \`string\`, got \`${typeof moduleId}\``);
  }

  const filePath = resolve(moduleId);

  if (!filePath) {
    return;
  }

  // Delete itself from module parent
  if (require.cache[filePath] && require.cache[filePath]?.parent) {
    let i = require.cache[filePath]!.parent!.children.length;

    while (i--) {
      if (require.cache[filePath]!.parent!.children[i].id === filePath) {
        require.cache[filePath]!.parent!.children.splice(i, 1);
      }
    }
  }

  // Remove all descendants from cache as well
  if (require.cache[filePath]) {
    const { children } = require.cache[filePath]!;

    // Delete module from cache
    delete require.cache[filePath];

    for (const { id } of children) {
      clear(id);
    }
  }
};

export function clearProjectModules(projectRoot: string) {
  const directory = path.dirname(parentModule(__filename)!);

  //   for (const moduleId of Object.keys(require.cache)) {
  //     console.log(resolveFrom(directory, moduleId));
  //   }

  for (const moduleId of Object.keys(require.cache)) {
    if (
      // Module is inside of project root
      moduleId.includes(projectRoot) &&
      // Ignore modules inside of node_modules
      !/node_modules/.test(moduleId)
    ) {
      console.log(resolveFrom(directory, moduleId));
      clear(moduleId);
    }
  }
}
