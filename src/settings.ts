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

/**
 * Determine if we should validate the (versioned) dependencies listed in `package.json`.
 * This uses the `expo.packageJson.dependenciesValidation` setting from the configuration scope.
 */
export function isDependenciesValidationEnabled(scope?: ConfigurationScope) {
  return workspace
    .getConfiguration('expo.packageJson', scope)
    .get<boolean>('dependencyValidation', true);
}
