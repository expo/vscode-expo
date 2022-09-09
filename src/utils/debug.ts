import Debug from 'debug';

const NAMESPACE = 'vscode-expo';
const debug = Debug(NAMESPACE);

export function createDebug(category: string) {
  return debug.extend(category);
}

// vscode doesn't pipe the `DEBUG` environment variable,
// so we use `VSCODE_EXPO_DEBUG` instead.
if (process.env.VSCODE_EXPO_DEBUG) {
  Debug.enable(process.env.VSCODE_EXPO_DEBUG);
}
