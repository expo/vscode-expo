import vscode from 'vscode';

import { ExpoProjectCache } from './expo/project';
import { ManifestLinkProvider } from './manifestLinks';
import { TelemetryEvent, activateTelemetry } from './utils/telemetry';

// The contained provider classes are self-registering required subscriptions.
// It helps grouping this code and keeping it maintainable, so disable the eslint rule.
/* eslint-disable no-new */

export async function activate(context: vscode.ExtensionContext) {
  const projects = new ExpoProjectCache(context);

  new ManifestLinkProvider(context, projects);

  activateTelemetry(context)?.sendTelemetryEvent(TelemetryEvent.ACTIVATED);
}
