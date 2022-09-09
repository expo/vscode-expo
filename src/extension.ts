import vscode from 'vscode';

import { manifestLinkProvider } from './manifestLinks';
import { projectCache } from './utils/expo/project';
import { TelemetryEvent, activateTelemetry } from './utils/telemetry';

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(projectCache);
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(
      manifestLinkProvider.pattern,
      manifestLinkProvider
    )
  );

  activateTelemetry(context)?.sendTelemetryEvent(TelemetryEvent.ACTIVATED);
}
