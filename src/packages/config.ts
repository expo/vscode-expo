/**
 * Use a bundled version of the Expo Config package.
 * This is used to retrieve the app manifest from a project.
 *
 * @TODO Try to use the project's `@expo/config` package, since this could change per SDK version.
 */
export { getConfig } from '@expo/config/build/Config';
