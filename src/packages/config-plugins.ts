/**
 * Use a bundled version of the Config Plugins mod compiler.
 * This is used to "compile" or run the plugins on a manifest.
 *
 * @TODO Try to use the project's `@expo/config` package, since this could change per SDK version.
 */
export { compileModsAsync } from '@expo/config-plugins/build/plugins/mod-compiler';

/**
 * Reuse the `ModPlatform` type from the Config Plugins package.
 * This outlines the platforms we can expect from the Config Plugins.
 */
export type { ModPlatform } from '@expo/config-plugins/build/Plugin.types';

/**
 * Use a bundled version of the Gradle properties formatter.
 * This is used when previewing the project's Gradle properties.
 */
export { propertiesListToString as formatGradleProperties } from '@expo/config-plugins/build/android/Properties';

/**
 * Use a bundled version of the XML formatter.
 * This is used when previewing XML files within the project.
 */
export { format as formatXml } from '@expo/config-plugins/build/utils/XML';

/**
 * Use a bundled version of the Config Plugins resolver.
 * This is used when validating the project's app manifest.
 *
 * @TODO Try to use the project's `@expo/config` package, since this could change per SDK version.
 */
export {
  resolveConfigPluginFunction,
  resolveConfigPluginFunctionWithInfo,
} from '@expo/config-plugins/build/utils/plugin-resolver';
