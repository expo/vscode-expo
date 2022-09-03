import { TextDocument, workspace } from 'vscode';

/**
 * Determine if we should validate the config plugins within the document.
 * This uses the `expo.plugins.validate` setting from the document or default workspace scope.
 */
export function shouldValidatePlugins(document?: TextDocument) {
  return workspace.getConfiguration('expo', document).get<boolean>('plugins.validate', true);
}
