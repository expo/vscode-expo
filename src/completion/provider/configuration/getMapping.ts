import * as vscode from 'vscode';

import { Mapping } from '../configuration';

/**
 * From { "lib": "libraries", "other": "otherpath" }
 * To [ { key: "lib", value: "libraries" }, { key: "other", value: "otherpath" } ]
 * @param mappings { "lib": "libraries" }
 */
export function parseMappings(mappings: { [key: string]: string }): Mapping[] {
  return Object.entries(mappings).map(([key, value]) => ({ key, value }));
}

/**
 * Replace ${workspaceRoot} with workfolder.uri.path
 * @param mappings
 * @param workfolder
 */
export function replaceWorkspaceFolder(
  mappings: Mapping[],
  workfolder?: vscode.WorkspaceFolder
): Mapping[] {
  const rootPath = workfolder?.uri.path;

  if (rootPath) {
    /** Replace placeholder with workspace folder */
    return mappings.map(({ key, value }) => ({
      key,
      value: replaceWorkspaceFolderWithRootPath(value, rootPath),
    }));
  } else {
    /** Filter items out which contain a workspace root */
    return mappings.filter(({ value }) => !valueContainsWorkspaceFolder(value));
  }
}

/**
 * Replaces both placeholders with the rootpath
 * - ${workspaceRoot}    // old way and only legacy support
 * - ${workspaceFolder}  // new way
 * @param value
 * @param rootPath
 */
function replaceWorkspaceFolderWithRootPath(value: string, rootPath: string) {
  return value.replace('${workspaceRoot}', rootPath).replace('${workspaceFolder}', rootPath);
}

function valueContainsWorkspaceFolder(value: string): boolean {
  return value.includes('${workspaceRoot}') || value.includes('${workspaceFolder}');
}
