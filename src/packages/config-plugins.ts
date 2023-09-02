import { loadModuleFromProject } from '../utils/module';
import { TelemetryErrorEvent, withErrorTelemetry } from '../utils/telemetry';

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
 * @note This can get out of date and should be loaded from the project where possible.
 */
import { compileModsAsync } from '@expo/config-plugins/build/plugins/mod-compiler';

/**
 * Use the project's `@expo/config-plugin` mod compiler, or fallback to the bundled one.
 * The bundled one is an older version and will likely have less functionality.
 */
export function loadConfigPluginsModCompiler(projectRoot: string): {
  compileModsAsync: typeof compileModsAsync;
} {
  const module = withErrorTelemetry(TelemetryErrorEvent.MODULE_RESOLUTION, () =>
    loadModuleFromProject<typeof import('@expo/config-plugins/build/plugins/mod-compiler')>(
      projectRoot,
      ['expo', '@expo/config-plugins'],
      'build/plugins/mod-compiler'
    )
  );

  if (module) {
    return module;
  }

  console.warn(
    `Falling back to bundled version of '@expo/config-plugins/build/plugins/mod-compiler'`
  );

  return { compileModsAsync };
}

/**
 * Use a bundled version of the Config Plugins resolver.
 * This is used when validating the project's app manifest.
 *
 * @note This can get out of date and should be loaded from the project where possible.
 */
import {
  resolveConfigPluginFunction,
  resolveConfigPluginFunctionWithInfo,
} from '@expo/config-plugins/build/utils/plugin-resolver';

/**
 * Use the project's `@expo/config-plugin` plugin resolver, or fallback to the bundled one.
 * The bundled one is an older version and will likely have less functionality.
 */
export function loadConfigPluginsResolver(projectRoot: string): {
  resolveConfigPluginFunction: typeof resolveConfigPluginFunction;
  resolveConfigPluginFunctionWithInfo: typeof resolveConfigPluginFunctionWithInfo;
} {
  const module = withErrorTelemetry(TelemetryErrorEvent.MODULE_RESOLUTION, () =>
    loadModuleFromProject<typeof import('@expo/config-plugins/build/utils/plugin-resolver')>(
      projectRoot,
      ['expo', '@expo/config-plugins'],
      'build/utils/plugin-resolver'
    )
  );

  if (module) {
    return module;
  }

  console.warn(
    `Falling back to bundled version of '@expo/config-plugins/build/utils/plugin-resolver'`
  );

  return { resolveConfigPluginFunction, resolveConfigPluginFunctionWithInfo };
}
