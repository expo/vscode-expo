import * as vscode from 'vscode';

import { setupCompletionItemProvider } from './completion/setupCompletionItemProvider';
import { setupXdlManifest } from './manifest';
import { setupPreview } from './preview/setupPreview';
import { expoProject } from './utils/expo-project';
import { reporter, setupTelemetry, TelemetryEvent } from './utils/telemetry';

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(expoProject);

  try {
    const start = Date.now();

    await setupTelemetry(context);
    await Promise.all([
      setupXdlManifest(context),
      setupCompletionItemProvider(context),
      setupPreview(context),
    ]);

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
