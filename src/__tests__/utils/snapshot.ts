const DISALLOWED_LINES = [
  'projectRoot',
  'dynamicConfigPath',
  'staticConfigPath',
  'packageJsonPath',
  'currentFullName',
  'originalFullName',
];

/**
 * We can't store non-idempotent values in snapshots.
 * Else we would run into this issue quite a lot:
 *   - "packageJsonPath": "d:\\projects\\expo\\vscode-expo\\test\\fixture\\expo-app\\package.json",
 *   + "packageJsonPath": "/home/runner/work/vscode-expo/vscode-expo/test/fixture/expo-app/package.json",
 * Or this one:
 *   - \"currentFullName\": \"@anonymous/preview\",",
 *   + \"originalFullName\": \"@bycedric/preview\"",
 */
export function sanitizeSnapshotValues(content = '') {
  const lines = content
    .split(/[\n\r?]/)
    // Filter absolute path properties
    .filter((line) => !DISALLOWED_LINES.some((property) => line.includes(property)));

  return lines.join('\n');
}
