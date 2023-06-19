import { loadModuleFrom } from '../utils/module';

/** Load the `@expo/config-plugins` package from the project directory */
export function loadExpoConfigPlugins(projectRoot: string) {
  return loadModuleFrom<typeof import('@expo/config-plugins')>(projectRoot, '@expo/config-plugins');
}

/** Load the `@expo/config` package from the project directory */
export function loadExpoConfig(projectRoot: string) {
  return loadModuleFrom<typeof import('@expo/config')>(projectRoot, '@expo/config');
}

/** Load the `@expo/prebuild-config` package from the project directory */
export function loadExpoPrebuildConfig(projectRoot: string) {
  return loadModuleFrom<typeof import('@expo/prebuild-config')>(
    projectRoot,
    '@expo/prebuild-config'
  );
}

/** Load the `@expo/plist` package from the project directory */
export function loadExpoPlist(projectRoot: string) {
  return loadModuleFrom<typeof import('@expo/plist')>(projectRoot, '@expo/plist');
}
