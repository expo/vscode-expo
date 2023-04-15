// This workaround is required for Webpack to leave the require statements unprocessed
declare const __non_webpack_require__: NodeRequire;
const actualRequire = (__non_webpack_require__ as typeof require) || require;

/**
 * Reset a single resolved module from the cache registry.
 */
function resetModule(module: NodeModule) {
  // Delete this module from possible parents
  for (const cached of Object.values(actualRequire.cache)) {
    if (!cached) continue;

    const index = cached.children.indexOf(module);
    if (index >= 0) {
      cached.children.splice(index, 1);
    }
  }

  // Delete itself from the cache
  delete actualRequire.cache[module.id];

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
    const modulePaths = actualRequire.resolve.paths(moduleOrFile) ?? [];
    const moduleId = actualRequire.resolve(moduleOrFile, { paths: [dir, ...modulePaths] });
    const module = actualRequire.cache[moduleId];

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
  const cachedIds = Object.keys(actualRequire.cache).filter(
    (cacheId) => cacheId.startsWith(dir) && !/node_modules/.test(cacheId)
  );

  for (const cachedId of cachedIds) {
    const module = actualRequire.cache[cachedId];
    if (module) {
      resetModule(module);
    }
  }

  return cachedIds;
}
