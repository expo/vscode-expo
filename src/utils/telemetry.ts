import TelemetryReporter, {
  TelemetryEventMeasurements,
  TelemetryEventProperties,
} from '@vscode/extension-telemetry';
import { ExtensionContext } from 'vscode';

import { debug } from './debug';

const log = debug.extend('telemetry');

/** The telemetry instrumentation key */
const telemetryKey = process.env.VSCODE_EXPO_TELEMETRY_KEY;

/** The telemetry singleton instance */
export let reporter: TelemetryReporter | null = null;

/** The different telemetry event types */
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
export function setupTelemetry(context: ExtensionContext) {
  if (!telemetryKey) {
    return log('Telemetry key is not set, skipping telemetry setup');
  }

  if (!reporter) {
    const extensionId = context.extension.id;
    const extensionVersion = context.extension.packageJSON.version;

    reporter = new TelemetryReporter(extensionId, extensionVersion, telemetryKey);
    context.subscriptions.push(reporter);
  }

  return reporter;
}

/**
 * Wrap a block inside an error telemetry reporter.
 * This will re-throw the error after reporting it.
 */
export async function withErrorTelemetry<T>(
  action: () => T | Promise<T>,
  properties?: TelemetryEventProperties,
  measurements?: TelemetryEventMeasurements
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    reporter?.sendTelemetryException(error, properties, measurements);
    throw error;
  }
}
