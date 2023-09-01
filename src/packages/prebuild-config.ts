/* eslint-disable import/first,import/order */

/**
 * Use a bundled version of the prebuild config generator.
 * This is used to retrieve the config for Config Plugins.
 *
 * @note This can get out of date and should be loaded from the project where possible.
 */
import { getPrebuildConfigAsync } from '@expo/prebuild-config/build/getPrebuildConfig';

/**
 * Use the project's `@expo/prebuild-config/build/getPrebuildConfig` loader, or fallback to the bundled one.
 * The bundled one is an older version and will likely have less functionality.
 */
export function loadPrebuildConfig(projectRoot: string): {
  getPrebuildConfigAsync: typeof getPrebuildConfigAsync;
} {
  return { getPrebuildConfigAsync };
}
