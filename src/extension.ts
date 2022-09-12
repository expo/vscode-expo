import vscode from 'vscode';

import { ExpoProjectCache } from './expo/project';
import { ManifestAssetCompletionProvider } from './manifestAssetCompletion';
import { ManifestDiagnosticProvider } from './manifestDiagnostic';
import { ManifestLinkProvider } from './manifestLinks';
import { ManifestPluginCompletionProvider } from './manifestPluginCompletion';
import { TelemetryEvent, activateTelemetry } from './utils/telemetry';

// The contained provider classes are self-registering required subscriptions.
// It helps grouping this code and keeping it maintainable, so disable the eslint rule.
/* eslint-disable no-new */

export async function activate(context: vscode.ExtensionContext) {
  const projects = new ExpoProjectCache(context);

  new ManifestLinkProvider(context, projects);
  new ManifestDiagnosticProvider(context, projects);
  new ManifestAssetCompletionProvider(context, projects);
  new ManifestPluginCompletionProvider(context, projects);

  activateTelemetry(context)?.sendTelemetryEvent(TelemetryEvent.ACTIVATED);
}
