import minimatch from 'minimatch';
import path from 'path';

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
    ([pattern, isExcluded]) => isExcluded && minimatch(filePath, pattern)
  );
}
