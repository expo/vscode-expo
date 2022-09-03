import Debug from 'debug';

/** The namespace tag used for logging */
export const TAG = 'vscode-expo';

/** The root debug logger for the extension, use `debug.extend` to create sub-loggers */
export const debug = Debug(TAG);

// vscode doesn't pipe the `DEBUG` environment variable,
// so we use `EXPO_DEBUG` instead.
if (process.env.EXPO_DEBUG) {
  Debug.enable(process.env.EXPO_DEBUG);
}
