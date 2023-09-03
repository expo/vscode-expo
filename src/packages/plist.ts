/* eslint-disable import/first,import/order */

/**
 * Use a bundled version of the plist formatter.
 * This is used when previewing iOS plist files within the project.
 * The library itself likely won't change much, so it's safe to only rely on the bundled version.
 */
import plist from '@expo/plist';
export const formatPlist = plist.build;
