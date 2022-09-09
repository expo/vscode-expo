import TelemetryReporter from '@vscode/extension-telemetry';
import { ExtensionContext } from 'vscode';

import { createDebug } from './debug';

const log = createDebug('telemetry');
const telemetryKey = process.env.VSCODE_EXPO_TELEMETRY_KEY;

export let reporter: TelemetryReporter | null = null;

export enum TelemetryEvent {
  ACTIVATED = 'activated',
  PREVIEW_CONFIG = 'previewConfig',
  PREVIEW_PREBUILD = 'previewPrebuild',
}

/**
 * Initialize the telemetry for error reporting and extension improvements.
 * This data is anonymous and does not contain any personal information.
 * You can opt-out to telemetry by disabling telemetry in vscode.
 *
 * @see https://code.visualstudio.com/docs/getstarted/telemetry
 */
export function activateTelemetry(context: ExtensionContext) {
  if (!telemetryKey) {
    return log('Telemetry key is not set');
  }

  if (!reporter) {
    const extensionId = context.extension.id;
    const extensionVersion = context.extension.packageJSON.version;

    reporter = new TelemetryReporter(extensionId, extensionVersion, telemetryKey);
    context.subscriptions.push(reporter);
  }

  return reporter;
}
