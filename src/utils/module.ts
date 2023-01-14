/**
 * Resolve a module or file from a directory, using module resolution.
 * This uses the paths from `require.resolve.paths` to look in various places.
 */
export function resolveFrom(dir: string, moduleOrFile: string) {
  try {
    return require.resolve(moduleOrFile, { paths: require.resolve.paths(dir) || [dir] });
  } catch {
    return undefined;
  }
}

/**
 * Reset an imported file or module from the module registry.
 * Both the directory and imported module or file are required.
 */
export function resetModuleFrom(dir: string, moduleOrFile: string): string | undefined {
  try {
    const moduleId = require.resolve(moduleOrFile, { paths: [dir] });
    const module = require.cache[moduleId];

    if (module) {
      for (const child of module.children) {
        delete require.cache[child.id];
      }

      delete require.cache[moduleId];
    }

    return moduleId;
  } catch {
    return undefined;
  }
}
