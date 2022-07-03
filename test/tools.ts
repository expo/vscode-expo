import vscode from 'vscode';

const pkg = require('../../package');

/**
 * The unique ID of this extension.
 */
export const EXTENSION_ID = `${pkg.publisher}.${pkg.name}`;

/**
 * Get information from vscode about this extension.
 */
export const getExtension = () => vscode.extensions.getExtension(EXTENSION_ID)!;

/**
 * Wait until the extension is activated.
 * This is a hacky workaround for the missing lifecycle events in the VSCode API.
 * It pings the extension's `isActive` property with a max duration of 5 seconds.
 */
export const waitForExtensionActivation = async (maxWait = 5 * 1000, delay = 1000) =>
  new Promise<void>((resolve) => {
    let checkTimer: NodeJS.Timeout;

    const maxTimer = setTimeout(() => {
      clearTimeout(checkTimer);
      resolve();
    }, maxWait);

    function pingExtension() {
      if (getExtension().isActive) {
        clearTimeout(maxTimer);
        resolve();
      } else {
        checkTimer = setTimeout(pingExtension, delay);
      }
    }

    pingExtension();
  });
