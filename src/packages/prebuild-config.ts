/* eslint-disable import/first,import/order */

/**
 * Use a bundled version of the prebuild config generator.
 * This is used to retrieve the config for Config Plugins.
 *
 * @note This package is slightly outdated, attempt to load from `npx expo config` instead.
 */
export { getPrebuildConfigAsync } from '@expo/prebuild-config/build/getPrebuildConfig';
