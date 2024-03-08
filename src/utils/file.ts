import path from 'path';
import picomatch from 'picomatch';
import vscode from 'vscode';

/**
 * Get the directory path from a user-provided file path.
 * This slightly differs from the `path.dirname` function:
 *   - ./        -> null    (path.dirname: '.')
 *   - ./abc     -> null    (path.dirname: '.')
 *   - ./abc/    -> './abc' (path.dirname: '.')
 *   - ./abc/def -> './abc' (path.dirname: './abc')
 */
export function getDirectoryPath(filePath: string) {
  const dir = path.dirname(filePath);
  if (dir === '.') {
    if (filePath.endsWith('/')) {
      return path.basename(filePath);
    }
    return null;
  }
  return dir;
}

export function fileIsHidden(filePath: string) {
  return filePath.startsWith('.');
}

export function fileIsExcluded(filePath: string, filesExcluded?: Record<string, boolean>) {
  if (!filesExcluded) {
    return false;
  }

  return Object.entries(filesExcluded).some(
    ([pattern, isExcluded]) => isExcluded && picomatch(pattern)(filePath)
  );
}

/** Read a workspace file through vscode's workspace API and return the string equivalent */
export async function readWorkspaceFile(uri: vscode.Uri) {
  return Buffer.from(await vscode.workspace.fs.readFile(uri)).toString('utf-8');
}

/** Create a new relative URI from existing URI */
export function relativeUri(uri: vscode.Uri, relativePath: string) {
  return uri.with({ path: path.posix.join(uri.path, relativePath) });
}
