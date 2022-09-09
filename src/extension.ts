import vscode from 'vscode';

import { projectCache } from './expo/project';
import { manifestLinkProvider } from './manifestLinks';
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
