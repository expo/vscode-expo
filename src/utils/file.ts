import minimatch from 'minimatch';

/**
 * Get the directory path from a user-provided file path.
 * This filters out non-completed folders to use as search starting path.
 */
export function getSearchDirectoryPath(filePath: string) {
  const lastConfirm = filePath.lastIndexOf('/');
  const searchPath = filePath.substring(0, lastConfirm);
  return !searchPath || searchPath === '.' ? null : searchPath;
}

export function fileIsHidden(fileName: string) {
  return fileName.startsWith('.');
}

export function fileIsExcluded(fileName: string, filesExcluded?: Record<string, boolean>) {
  if (!filesExcluded) {
    return false;
  }

  return Object.entries(filesExcluded).some(
    ([pattern, isExcluded]) => isExcluded && minimatch(fileName, pattern)
  );
}
