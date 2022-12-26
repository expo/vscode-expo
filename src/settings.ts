import { ConfigurationScope, workspace } from 'vscode';

/**
 * Determine if we should validate the config plugins within app manifests.
 * This uses the `expo.appManifest.pluginValidation` setting from the configuration scope.
 */
export function isManifestPluginValidationEnabled(scope?: ConfigurationScope) {
  return workspace
    .getConfiguration('expo.appManifest', scope)
    .get<boolean>('pluginValidation', true);
}

/**
 * Determine if we should show file references auto-complete in app manifests.
 * This uses the `expo.appManifest.fileReferences` setting from the configuration scope.
 */
export function isManifestFileReferencesEnabled(scope?: ConfigurationScope) {
  return workspace.getConfiguration('expo.appManifest', scope).get<boolean>('fileReferences', true);
}

/**
 * Get the excluded files configuration, used to filter out path-based suggestions.
 * This is a combination of multiple glob patterns:
 *   - `files.exclude` - main vscode file exclusion
 *   - `expo.appManifest.fileReferences.excludeGlobPatterns` - expo-specific file exclusion
 */
export function getManifestFileReferencesExcludedFiles(scope?: ConfigurationScope) {
  const config = workspace.getConfiguration(undefined, scope);

  return {
    ...config.get<Record<string, boolean>>('files.exclude', {}),
    ...config.get<Record<string, boolean>>('expo.appManifest.fileReferences.excludeGlobPatterns', {
      '**/node_modules': true,
    }),
  };
}

/**
 * Get the manifest file references configuration set.
 * This uses multiple settings from the configuration scope.
 *   - `expo.appManifest.fileReferences.showHiddenFiles`
 *   - `expo.appManifest.fileReferences.excludeGlobPatterns`
 *   - `expo.appManifest.fileReferences.useAbsolutePathsForFileReferences` (hidden)
 *   - `expo.appManifest.fileReferences.mappings` (hidden)
 */
export function getManifestFileReferencesConfig(scope?: ConfigurationScope) {
  const config = workspace.getConfiguration('expo.appManifest.fileReferences', scope);

  return {
    showHiddenFiles: config.get<boolean>('showHiddenFiles', false),
    filesExclude: config.get<Record<string, string> | null>('excludeGlobPatterns', null),
    // TODO(cedric): Check if the settings blow this comment are still required
    absolutePathToWorkspace: config.get<boolean>('useAbsolutePathsForFileReferences', false),
    mappings: config.get<Record<string, string> | null>('mappings', null),
  };
}
