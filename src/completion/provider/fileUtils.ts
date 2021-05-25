import { promises, statSync } from 'fs';
import minimatch from 'minimatch';
import * as path from 'path';

import { Config } from './configuration/getConfiguration';
import { Mapping } from './configuration/getMapping';

export class FileInfo {
  isFile: boolean;
  constructor(public filePath: string, public file: string) {
    this.isFile = statSync(path.join(filePath, file)).isFile();
  }
}

/**
 * @param fileName  {string} current filename the look up is done. Absolute path
 * @param text      {string} text in import string. e.g. './src/'
 */
export function getPathOfFolderToLookupFiles(
  fileName: string,
  text: string | undefined,
  rootPath?: string,
  mappings?: Mapping[]
): string {
  const normalizedText = path.normalize(text || '');

  const isPathAbsolute = normalizedText.startsWith(path.sep);

  let rootFolder = path.dirname(fileName);
  let pathEntered = normalizedText;

  // Search a mapping for the current text. First mapping is used where text starts with mapping
  const mapping =
    mappings &&
    mappings.reduce((prev: any, curr: any) => {
      return prev || (normalizedText.startsWith(curr.key) && curr);
    }, undefined);

  if (mapping) {
    rootFolder = mapping.value;
    pathEntered = normalizedText.substring(mapping.key.length, normalizedText.length);
  }

  if (isPathAbsolute) {
    rootFolder = rootPath || '';
  }

  return path.join(rootFolder, pathEntered);
}

export async function getChildrenOfPath(path: string, config: Config) {
  try {
    const files: string[] = await promises.readdir(path);
    return files
      .filter((filename) => filterFile(filename, config))
      .map((f) => new FileInfo(path, f));
  } catch {
    return [];
  }
}

function filterFile(filename: string, config: Config) {
  if (config.showHiddenFiles) {
    return true;
  }

  return !isFileHidden(filename, config);
}

function isFileHidden(filename: string, config: Config) {
  return filename.startsWith('.') || isFileHiddenByVsCode(filename, config);
}

// files.exclude has the following form. key is the glob
// {
//    "**//*.js": true
//    "**//*.js": true "*.git": true
// }
function isFileHiddenByVsCode(filename: string, config: Config) {
  if (!config.filesExclude) {
    return false;
  }

  for (const key of Object.keys(config.filesExclude)) {
    if (minimatch(filename, key)) {
      return true;
    }
  }
  return false;
}
