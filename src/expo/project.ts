import findUp from 'find-up';
import fs from 'fs';
import * as jsonc from 'jsonc-parser';
import path from 'path';
import { TextDocument } from 'vscode';

import { MapCacheProvider } from '../utils/cache';
import { debug } from '../utils/debug';

const log = debug.extend('project');

/**
 * The Expo project cache keeps track of resolved project information.
 * It's designed to work as "just-in-time"-resolving to avoid unnecessary heavy operations.
 *
 * For example, the `app.json` is only updated when it's requested through the `fromManifest`.
 * You can use `fromManifest` or `fromPackage` when providing document links or diagnostics.
 */
export class ExpoProjectCache extends MapCacheProvider<ExpoProject> {
  fromRoot(root: string) {
    if (!this.cache.has(root)) {
      const packageFile = parseJsonFile(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));

      if (packageFile) {
        this.cache.set(root, new ExpoProject(root, packageFile));
      }
    }

    return this.cache.get(root);
  }

  fromPackage(pkg: TextDocument) {
    const project = this.fromRoot(path.dirname(pkg.fileName));
    project?.setPackage(pkg.getText());
    return project;
  }

  fromManifest(manifest: TextDocument) {
    const root = findUp.sync('package.json', { cwd: manifest.fileName });
    const project = root ? this.fromRoot(path.dirname(root)) : undefined;
    project?.setManifest(manifest.getText());
    return project;
  }
}

export class ExpoProject {
  constructor(
    public readonly root: string,
    private packageFile: JsonFile,
    private manifestFile?: JsonFile
  ) {
    log('created new project %s', root);
  }

  get package() {
    return this.packageFile;
  }

  get manifest() {
    return this.manifestFile;
  }

  setPackage(content: string) {
    if (content === this.packageFile.content) {
      return this.packageFile;
    }

    const file = parseJsonFile(content);
    if (file) {
      this.packageFile = file;
    }

    return this.packageFile;
  }

  setManifest(content: string) {
    if (this.manifestFile && content === this.manifestFile.content) {
      return this.manifestFile;
    }

    const file = parseJsonFile(content, ['expo']);
    if (file) {
      this.manifestFile = file;
    }

    return this.manifestFile;
  }
}

interface JsonFile {
  tree: jsonc.Node;
  content: string;
}

/**
 * Parse a JSON file and keep track of both content and JSON tree.
 * If the provided JSON path can't be parsed, it will return `undefined`.
 */
function parseJsonFile(content: string, path?: jsonc.JSONPath): JsonFile | undefined {
  let tree = jsonc.parseTree(content);
  if (tree && path) {
    tree = jsonc.findNodeAtLocation(tree, path);
  }

  return tree ? { tree, content } : undefined;
}
