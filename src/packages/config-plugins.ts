/* eslint-disable import/first,import/order */

/**
 * Reuse the `ModPlatform` type from the Config Plugins package.
 * This outlines the platforms we can expect from the Config Plugins.
 */
export type { ModPlatform } from '@expo/config-plugins/build/Plugin.types';

/**
 * Use a bundled version of the Gradle properties formatter.
 * This is used when previewing the project's Gradle properties.
 * The library itself likely won't change much, so it's safe to only rely on the bundled version.
 */
export { propertiesListToString as formatGradleProperties } from '@expo/config-plugins/build/android/Properties';

/**
 * Use a bundled version of the XML formatter.
 * This is used when previewing XML files within the project.
 * The library itself likely won't change much, so it's safe to only rely on the bundled version.
 */
export { format as formatXml } from '@expo/config-plugins/build/utils/XML';

/**
 * Use a bundled version of the Config Plugins mod compiler.
 * This is used to "compile" or run the plugins on a manifest.
 *
 * @note This bundled package is slightly outdated, attempt to load from `npx expo config` instead.
 */
export { compileModsAsync } from '@expo/config-plugins/build/plugins/mod-compiler';

/**
 * Use a bundled version of the Config Plugins resolver.
 * This is used when validating the project's app manifest.
 *
 * @note This bundled package is slightly outdated and should be loaded from the project where possible.
 */
export {
  resolveConfigPluginFunction,
  resolveConfigPluginFunctionWithInfo,
} from '@expo/config-plugins/build/utils/plugin-resolver';
