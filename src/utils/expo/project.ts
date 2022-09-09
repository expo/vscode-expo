import findUp from 'find-up';
import fs from 'fs';
import path from 'path';
import { DocumentFilter, TextDocument } from 'vscode';

import { MapCache } from '../cache';
import { createDebug } from '../debug';
import { JsonFile, parseJson } from '../json';

const log = createDebug('project-cache');

export const manifestPattern: DocumentFilter = {
  scheme: 'file',
  language: 'json',
  pattern: '**/*/app{,.config}.json',
};

class ExpoProject {
  constructor(
    public readonly root: string,
    private packageFile: JsonFile,
    private manifestFile?: JsonFile
  ) {}

  get package() {
    return this.packageFile;
  }

  get manifest() {
    return this.manifestFile;
  }

  updatePackage(content: string) {
    if (content === this.packageFile.content) {
      return this.packageFile;
    }

    const file = parseJson(content);
    if (file) {
      this.packageFile = file;
    }

    return this.packageFile;
  }

  updateManifest(content: string) {
    if (this.manifestFile && content === this.manifestFile.content) {
      return this.manifestFile;
    }

    const file = parseJson(content, ['expo']);
    if (file) {
      this.manifestFile = file;
    } else {
      this.manifestFile = undefined;
    }

    return this.manifestFile;
  }
}

/**
 * The Expo project cache keeps track of resolved project information.
 * It's designed to work as "just-in-time"-resolving to avoid unnecessary heavy operations.
 *
 * For example, the `app.json` is only updated when it's requested through the `fromManifest`.
 * You can use `fromManifest` or `fromPackage` when providing document links or diagnostics.
 */
class ExpoProjectCache extends MapCache<ExpoProject> {
  fromRoot(root: string) {
    if (!this.cache.has(root)) {
      const packageFile = parseJson(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));

      if (packageFile) {
        this.cache.set(root, new ExpoProject(root, packageFile));
        log('created new project %s', root);
      }
    }

    return this.cache.get(root);
  }

  fromManifest(manifest: TextDocument) {
    const root = findUpProjectRoot(manifest.fileName);
    const project = root ? this.fromRoot(root) : undefined;
    project?.updateManifest(manifest.getText());
    return project;
  }

  fromPackage(pkg: TextDocument) {
    const project = this.fromRoot(path.dirname(pkg.fileName));
    project?.updatePackage(pkg.getText());
    return project;
  }
}

export const projectCache = new ExpoProjectCache();

/** Find the closest sibling or parent `package.json` from the given file or directory path */
export function findUpProjectRoot(fileOrDir: string): string | undefined {
  const packageFile = findUp.sync('package.json', { cwd: fileOrDir });
  return packageFile ? path.dirname(packageFile) : undefined;
}
