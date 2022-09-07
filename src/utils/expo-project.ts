import findUp from 'find-up';
import fs from 'fs';
import { parseTree, Node, findNodeAtLocation } from 'jsonc-parser';
import path from 'path';
import vscode from 'vscode';

import { debug } from './debug';

const log = debug.extend('project');

/**
 * The Expo project context keeps track of resolved project information.
 * It's designed to work as "just-in-time"-resolving to avoid unnecessary heavy operations.
 *
 * For example, the `app.json` is only updated when it's requested through the `fromManifest`.
 * You can use `fromManifest` or `fromPackage` when providing document links or diagnostics.
 */
class ExpoProjectContext implements vscode.Disposable {
  /** Expo project cache contains the resolved projects for a project root */
  private cache: Map<string, ExpoProject> = new Map();

  /** Dispose the resolved project information from the cache */
  dispose() {
    this.cache.clear();
  }

  /**
   * Retrieve a project from the `app.json` file.
   * This resolves the project root based on the `app.json` path.
   * When a project is found or created, the manifest file is updated from the document.
   */
  fromManifest(manifest: vscode.TextDocument): ExpoProject | undefined {
    const root = findUpProjectRoot(manifest.fileName);
    const project = root ? this.fromProjectRoot(root) : undefined;
    project?.updateManifest(manifest.getText());
    return project;
  }

  /**
   * Retrieve a project from the `package.json` file.
   * This uses the dirname from the file as project root.
   * When a project is found or created, the package file is updated from the document.
   */
  fromPackage(pkg: vscode.TextDocument): ExpoProject | undefined {
    const project = this.fromProjectRoot(path.dirname(pkg.fileName));
    project?.updatePackage(pkg.getText());
    return project;
  }

  /**
   * Retrieve a project from the resolved project root.
   * This only creates a new project when the `./package.json` is found and parsed.
   */
  fromProjectRoot(root: string): ExpoProject | undefined {
    if (!this.cache.has(root)) {
      const packageFile = path.join(root, 'package.json');
      const content = fs.readFileSync(packageFile, 'utf-8');
      const tree = parseTree(content);

      if (tree) {
        this.cache.set(root, new ExpoProject(root, { tree, content }));
        log('Created new Expo project for %s', root);
      }
    }

    return this.cache.get(root);
  }
}

/**
 * A JSON file is a parsed JSON content, with it's raw content.
 * Use this to interact with the raw contents or the parsed tree.
 */
interface JsonFile {
  tree: Node;
  content: string;
}

class ExpoProject {
  /** The resolved Expo manifest file, when using JSON format */
  private manifestFile?: JsonFile;

  constructor(
    /** The resolved Expo project root */
    public readonly root: string,
    /** The resolved `package.json` within the Expo project root */
    private packageFile: JsonFile
  ) {}

  get manifest() {
    return this.manifestFile;
  }

  get package() {
    return this.packageFile;
  }

  /**
   * Try to update the package file from the raw contents of `package.json`.
   * This should only happen when users open the `package.json` file.
   */
  updatePackage(content: string) {
    if (content === this.packageFile.content) {
      return this.packageFile;
    }

    const tree = parseTree(content);
    if (tree) {
      this.packageFile = { tree, content };
    }

    return this.packageFile;
  }

  /**
   * Try to update the manifest from the raw contents of `app.json`.
   * If the previously parsed manifest string did not change, it returns the existing manifest.
   */
  updateManifest(content: string) {
    if (this.manifestFile && content === this.manifestFile.content) {
      return this.manifestFile;
    }

    const tree = parseTree(content);
    const expo = tree ? findNodeAtLocation(tree, ['expo']) : undefined;

    if (expo) {
      this.manifestFile = { tree: expo, content };
    } else {
      this.manifestFile = undefined;
    }

    return this.manifestFile;
  }
}

/** The Expo project context or cache, containing resolved project information */
export const expoProject = new ExpoProjectContext();

/** Find the closest sibling or parent `package.json` from the given file or directory path */
export function findUpProjectRoot(fileOrDir: string): string | null {
  const packageFile = findUp.sync('package.json', { cwd: fileOrDir });
  return packageFile ? path.dirname(packageFile) : null;
}
