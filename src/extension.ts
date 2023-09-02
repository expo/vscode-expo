import vscode from 'vscode';

import { ExpoProjectCache } from './expo/project';
import { ExpoDebuggersProvider } from './expoDebuggers';
import { ManifestAssetCompletionsProvider } from './manifestAssetCompletions';
import { ManifestDiagnosticsProvider } from './manifestDiagnostics';
import { ManifestLinksProvider } from './manifestLinks';
import { ManifestPluginCompletionsProvider } from './manifestPluginCompletions';
import { setupPreview } from './preview/setupPreview';
import {
  getErrorProperties,
  reporter,
  setupTelemetry,
  TelemetryErrorEvent,
  TelemetryEvent,
} from './utils/telemetry';

export async function activate(context: vscode.ExtensionContext) {
  // The contained provider classes are self-registering required subscriptions.
  // It helps grouping this code and keeping it maintainable, so disable the eslint rule.
  /* eslint-disable no-new */

  try {
    const projects = new ExpoProjectCache(context);

    setupTelemetry(context);
    setupPreview(context);

    new ExpoDebuggersProvider(context, projects);

    new ManifestLinksProvider(context, projects);
    new ManifestDiagnosticsProvider(context, projects);
    new ManifestPluginCompletionsProvider(context, projects);
    new ManifestAssetCompletionsProvider(context, projects);

    reporter?.sendTelemetryEvent(TelemetryEvent.ACTIVATED);
  } catch (error) {
    vscode.window.showErrorMessage(
      `Oops, looks like we can't fully activate Expo Tools: ${error.message}`
    );

    reporter?.sendTelemetryErrorEvent(TelemetryErrorEvent.ACTIVATION, getErrorProperties(error));
  }
}
