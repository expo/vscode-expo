import * as vscode from 'vscode';

import { setupCompletionItemProvider } from './completion/setupCompletionItemProvider';
import { ExpoProjectCache } from './expo/project';
import { setupXdlManifest } from './manifest';
import { ManifestLinksProvider } from './manifestLinks';
import { setupPreview } from './preview/setupPreview';
import { reporter, setupTelemetry, TelemetryEvent } from './utils/telemetry';

// The contained provider classes are self-registering required subscriptions.
// It helps grouping this code and keeping it maintainable, so disable the eslint rule.
/* eslint-disable no-new */

export async function activate(context: vscode.ExtensionContext) {
  try {
    const start = Date.now();
    const projects = new ExpoProjectCache(context);

    await setupTelemetry(context);
    await Promise.all([
      setupXdlManifest(context),
      setupCompletionItemProvider(context),
      setupPreview(context),
    ]);

    new ManifestLinksProvider(context, projects);

    reporter?.sendTelemetryEvent(TelemetryEvent.ACTIVATED, undefined, {
      duration: Date.now() - start,
    });
  } catch (error) {
    reporter?.sendTelemetryException(error);
    vscode.window.showErrorMessage(
      `Oops, looks like we can't fully activate Expo Tools: ${error.message}`
    );
  }
}
