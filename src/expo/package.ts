import { DocumentFilter } from 'vscode';

/** @see https://github.com/microsoft/vscode/blob/be54d2be91cc7443d0c44ed2a483475b12747b2d/extensions/npm/src/npmMain.ts#L149-L153 */
export const packagePattern: DocumentFilter = {
  scheme: 'file',
  language: 'json',
  pattern: '**/package.json',
};
