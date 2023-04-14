/**
 * Reset a single resolved module from the cache registry.
 */
function resetModule(module: NodeModule) {
  // Delete this module from possible parents
  for (const cached of Object.values(require.cache)) {
    if (!cached) continue;

    const index = cached.children.indexOf(module);
    if (index >= 0) {
      cached.children.splice(index, 1);
    }
  }

  // Delete itself from the cache
  delete require.cache[module.id];

  // Delete all children of this module from cache
  for (const child of module.children) {
    resetModule(child);
  }
}

/**
 * Reset an imported file or module from the module registry.
 * Both the directory and imported module or file are required.
 */
export function resetModuleFrom(dir: string, moduleOrFile: string) {
  try {
    const modulePaths = require.resolve.paths(moduleOrFile) ?? [];
    const moduleId = require.resolve(moduleOrFile, { paths: [dir, ...modulePaths] });
    const module = require.cache[moduleId];

    if (module) {
      resetModule(module);
    }

    return moduleId;
  } catch {
    return undefined;
  }
}

/**
 * Reset all imported files or modules from the module registry, by directory.
 */
export function resetModulesFrom(dir: string) {
  // Find all cached modules matching the directory
  const cachedIds = Object.keys(require.cache).filter(
    (cacheId) => cacheId.startsWith(dir) && !/node_modules/.test(cacheId)
  );

  for (const cachedId of cachedIds) {
    const module = require.cache[cachedId];
    if (module) {
      resetModule(module);
    }
  }

  return cachedIds;
}
