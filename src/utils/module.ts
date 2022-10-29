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
