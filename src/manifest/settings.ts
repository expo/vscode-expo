import { TextDocument, workspace } from 'vscode';

// Enable toggling in settings via expo.config.validate.enable
export function isConfigPluginValidationEnabled(document: TextDocument) {
  const section = workspace.getConfiguration('expo', document.uri);
  if (section) {
    return section.get<boolean>('plugins.validate', true);
  }
  return false;
}
