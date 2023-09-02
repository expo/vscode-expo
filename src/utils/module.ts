import path from 'path';

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
    const moduleId = require.resolve(moduleOrFile, { paths: [dir] });
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

/**
 * Load a module, through a chain of dependencies, from the project root.
 * This will attempt to load a module from the user's project.
 * When it fails, it will warn and return `undefined`.
 *
 * There are two types of error messages that can be thrown, both using `MODULE_NOT_FOUND` error codes:
 *   - Cannot find module '@expo/config-plugins/package.json' (expo → @expo/config-plugins)
 *   - Cannot find module '@expo/config-plugins/non-existing/file', but did find '@expo/config-plugins'
 */
export function loadModuleFromProject<T extends any>(
  projectRoot: string,
  dependencies: string[],
  nestedFile?: string
): T {
  // Resolve the dependency chain, using the `<dependency>/package.json` files.
  // This allows us to use `path.dirname` to get to the root of the dependency.
  const dependencyPath = dependencies.reduce((currentFile, dependency, index) => {
    try {
      return path.dirname(
        require.resolve(path.join(dependency, 'package.json'), { paths: [currentFile] })
      );
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        const currentChain = dependencies.slice(0, index + 1).join(' → ');
        error.message = `Cannot find module '${dependency}/package.json' (${currentChain})`;
      }

      throw error;
    }
  }, projectRoot);

  // Append possibly nested imports to the found dependency path
  const dependencyImport = nestedFile ? path.join(dependencyPath, nestedFile) : dependencyPath;

  // Try to load the required file or module from the dependency
  try {
    return require(/* webpackIgnore: true */ dependencyImport);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      const currentDependency = path.basename(path.dirname(dependencyPath));
      const currentDependencyFile = path.join(currentDependency, nestedFile || '');
      error.message = `Cannot find module '${currentDependencyFile}', but did find '${currentDependency}'`;
    }

    throw error;
  }
}
