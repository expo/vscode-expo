/** Load the `@expo/config` package from the project directory */
export function loadExpoConfig(projectRoot: string): typeof import('@expo/config') {
  return require(/* webpackIgnore: true */ require.resolve('@expo/config', {
    paths: [projectRoot],
  }));
}

/** Load the `@expo/config-plugins` package from the project directory */
export function loadExpoConfigPlugins(projectRoot: string): typeof import('@expo/config-plugins') {
  return require(/* webpackIgnore: true */ require.resolve('@expo/config-plugins', {
    paths: [projectRoot],
  }));
}

/** Load the `@expo/config-plugins/build/utils/plugin-resolver` package from the project directory */
export function loadExpoConfigPluginsResolver(
  projectRoot: string
): typeof import('@expo/config-plugins/build/utils/plugin-resolver') {
  return require(/* webpackIgnore: true */ require.resolve(
    '@expo/config-plugins/build/utils/plugin-resolver',
    {
      paths: [projectRoot],
    }
  ));
}

/** Load the `@expo/prebuild-config` package from the project directory */
export function loadExpoPrebuildConfig(
  projectRoot: string
): typeof import('@expo/prebuild-config') {
  return require(/* webpackIgnore: true */ require.resolve('@expo/prebuild-config', {
    paths: [projectRoot],
  }));
}

/** Load the `@expo/plist` package from the project directory */
export function loadExpoPlist(projectRoot: string): typeof import('@expo/plist') {
  return require(/* webpackIgnore: true */ require.resolve('@expo/plist', {
    paths: [projectRoot],
  }));
}
