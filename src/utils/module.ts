export function resetModulesFrom(dir: string) {
  for (const moduleId of Object.keys(require.cache)) {
    const isModuleInDir = moduleId.includes(dir);
    const isNodeModule = /node_modules/.test(moduleId);

    if (isModuleInDir && !isNodeModule) {
      resetModuleFrom(dir, moduleId);
    }
  }
}

export function resetModuleFrom(dir: string, moduleOrFile: string) {
  const moduleId = require.resolve(moduleOrFile, { paths: [dir] });
  const module = require.cache[moduleId];

  if (module) {
    for (const child of module.children) {
      delete require.cache[child.id];
    }

    delete require.cache[moduleId];
  }
}
