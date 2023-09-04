import assert from 'assert';
import path from 'path';
import vscode from 'vscode';

import { type WaitForValueOptions, waitForTrue, waitForValue } from './wait';

const pkg = require('../../../../package');

/**
 * The unique ID of this extension.
 */
export const EXTENSION_ID = `${pkg.publisher}.${pkg.name}`;

/**
 * Get the URI to a file or folder within the workspace.
 */
export function getWorkspaceUri(relativePath: string): vscode.Uri {
  const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  assert(rootPath, `Workspace root path not found, can't create path to ${relativePath}`);
  return vscode.Uri.file(path.join(rootPath, relativePath));
}

/**
 * Wait until vscode has activated this extension.
 */
export function waitForExtension() {
  return waitForTrue(() => vscode.extensions.getExtension(EXTENSION_ID)?.isActive);
}

/**
 * Wait until vscode has opened a visible file.
 */
export function waitForEditorOpen(
  fileName: string,
  options?: WaitForValueOptions
): Promise<vscode.TextEditor | undefined> {
  return waitForValue(
    () =>
      vscode.window.visibleTextEditors.find(
        (editor) =>
          path.basename(editor.document.fileName) === fileName && !!editor.document.getText()
      ),
    options
  );
}

/**
 * Wait until the active tab name is opened.
 * This can by any type of file, from text editor to asset.
 */
export function waitForActiveTabNameOpen(tabName: string, delay = 500): Promise<true | undefined> {
  return waitForTrue(() => tabName === vscode.window.tabGroups.activeTabGroup.activeTab?.label, {
    delay,
  });
}

/**
 * Close all (currently open) text editors.
 * @see https://github.com/microsoft/vscode/blob/2980862817f29911a2231f4c88bfc783bd763cab/extensions/vscode-api-tests/src/utils.ts#L50
 */
export function closeAllEditors() {
  return vscode.commands.executeCommand('workbench.action.closeAllEditors');
}

/**
 * Close the current active editor.
 * Usually `closeAllEditors` should be used instead, but for 1 document tests this can be used when running into errors.
 */
export function closeActiveEditor() {
  return vscode.commands.executeCommand('workbench.action.closeActiveEditor');
}

/**
 * Find the editor content position by search string.
 */
export function findContentPosition(editor: vscode.TextEditor, search: string): vscode.Position {
  const content = editor.document.getText();
  const offset = content.indexOf(search);

  assert(offset >= 0, `Could not find offset of "${search}"`);

  return editor.document.positionAt(offset);
}

/**
 * Find the editor content range by search string.
 */
export function findContentRange(editor: vscode.TextEditor, search: string): vscode.Range {
  const start = findContentPosition(editor, search);
  const end = new vscode.Position(start.line, start.character + search.length);
  return new vscode.Range(start, end);
}

/**
 * Replace the contents of an open editor.
 */
export async function replaceEditorContent(editor: vscode.TextEditor, content: string) {
  const range = editor.document.validateRange(new vscode.Range(0, 0, editor.document.lineCount, 0));
  await editor.edit((builder) => builder.replace(range, content));
}

/**
 * Remember the original content of an editor.
 * This returns a function to restore the original content, even when it was saved.
 */
export function storeOriginalContent(editor: vscode.TextEditor): () => Promise<void> {
  const content = editor.document.getText();

  return async function restoreOriginalContent() {
    await replaceEditorContent(editor, content);
    await editor.document.save();
  };
}
