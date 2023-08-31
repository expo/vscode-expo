/**
 * Use a bundled version of the plist formatter.
 * This is used when previewing iOS plist files within the project.
 */
import plist from '@expo/plist';
export const formatPlist = plist.build;
