import vscode from 'vscode';

/**
 * Determine if we should validate the config plugins within app manifests.
 * This uses the `expo.appManifest.pluginValidation` setting from the configuration scope.
 */
export function isManifestPluginValidationEnabled(scope?: vscode.ConfigurationScope) {
  return vscode.workspace
    .getConfiguration('expo.appManifest', scope)
    .get<boolean>('pluginValidation', true);
}

export function changedManifesPluginValidationEnabled(event: vscode.ConfigurationChangeEvent) {
  return event.affectsConfiguration('expo.appManifest.pluginValidation');
}

/**
 * Determine if we should show file references auto-complete in app manifests.
 * This uses the `expo.appManifest.fileReferences` setting from the configuration scope.
 */
export function isManifestFileReferencesEnabled(scope?: vscode.ConfigurationScope) {
  return vscode.workspace
    .getConfiguration('expo.appManifest', scope)
    .get<boolean>('fileReferences', true);
}

export function changedManifestFileReferencesEnabled(event: vscode.ConfigurationChangeEvent) {
  return event.affectsConfiguration('expo.appManifest.fileReferences');
}

/**
 * Get the excluded files configuration, used to filter out path-based suggestions.
 * This is a combination of multiple glob patterns:
 *   - `files.exclude` - main vscode file exclusion
 *   - `expo.appManifest.fileReferences.excludeGlobPatterns` - expo-specific file exclusion
 */
export function getManifestFileReferencesExcludedFiles(scope?: vscode.ConfigurationScope) {
  const config = vscode.workspace.getConfiguration(undefined, scope);

  return {
    ...config.get<Record<string, boolean>>('files.exclude', {}),
    ...config.get<Record<string, boolean>>('expo.appManifest.fileReferences.excludeGlobPatterns', {
      '**/node_modules': true,
    }),
  };
}

export function changedManifestFileReferencesExcludedFiles(event: vscode.ConfigurationChangeEvent) {
  return (
    event.affectsConfiguration('files.exclude') ||
    event.affectsConfiguration('expo.appManifest.fileReferences.excludeGlobPatterns')
  );
}
