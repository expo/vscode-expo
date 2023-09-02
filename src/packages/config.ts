/* eslint-disable import/first,import/order */

/**
 * Use a bundled version of the Expo Config package.
 * This is used to retrieve the app manifest from a project.
 *
 * @note This package is slightly outdated, attempt to load from `npx expo config` instead.
 */
export { type ExpoConfig, getConfig } from '@expo/config/build/Config';
