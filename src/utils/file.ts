import path from 'path';

export function fileIsHidden(pathOrName: string): boolean {
  return path.basename(pathOrName).startsWith('.') || fileIsExcluded(pathOrName);
}

/**
 * Determine if the file path or file name is excluded through vscode configuration.
 */
export function fileIsExcluded(pathOrName: string): boolean {
  return false;
}
