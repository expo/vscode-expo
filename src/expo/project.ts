import findUp from 'find-up';
import fs from 'fs';
import * as jsonc from 'jsonc-parser';
import path from 'path';
import vscode from 'vscode';

import { MapCacheProvider } from '../utils/cache';
import { debug } from '../utils/debug';

const log = debug.extend('project');

/**
 * Find the project root from a file path.
 * This returns the directory where the first `package.json` was found.
 */
export function getProjectRoot(filePath: string) {
  const root = findUp.sync('package.json', { cwd: filePath });
  return root ? path.dirname(root) : undefined;
}

/**
 * Try to get the project root from any of the current workspaces.
 * This will iterate and try to detect an Expo project for each open workspaces.
 */
export function findProjectFromWorkspaces(projects: ExpoProjectCache, relativePath?: string) {
  const workspaces = vscode.workspace.workspaceFolders ?? [];

  for (const workspace of workspaces) {
    const project = findProjectFromWorkspace(projects, workspace, relativePath);
    if (project) return project;
  }

  return undefined;
}

/**
 * Try to get the Expo project from a specific workspace.
 * This is useful when the user already has selected the right workspace.
 */
export function findProjectFromWorkspace(
  projects: ExpoProjectCache,
  workspace: vscode.WorkspaceFolder,
  relativePath?: string
) {
  return relativePath
    ? projects.maybeFromRoot(path.join(workspace.uri.fsPath, relativePath))
    : projects.maybeFromRoot(workspace.uri.fsPath);
}

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

  fromPackage(pkg: vscode.TextDocument) {
    const project = this.fromRoot(path.dirname(pkg.fileName));
    project?.setPackage(pkg.getText());
    return project;
  }

  fromManifest(manifest: vscode.TextDocument) {
    const root = getProjectRoot(manifest.fileName);
    const project = root ? this.fromRoot(root) : undefined;
    project?.setManifest(manifest.getText());
    return project;
  }

  maybeFromRoot(root: string) {
    if (this.cache.has(root)) {
      return this.cache.get(root);
    }

    // Check if there is a `package.json` file
    if (!fs.existsSync(path.join(root, 'package.json'))) {
      return undefined;
    }

    // Check if that `package.json` file contains `"expo"` as dependency
    const packageFile = parseJsonFile(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
    if (!packageFile?.content.includes('"expo"')) {
      return undefined;
    }

    const project = new ExpoProject(root, packageFile);
    this.cache.set(root, project);
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

  resolveWorkflow() {
    const hasAndroid = fs.existsSync(path.join(this.root, 'android'));
    const hasiOS = fs.existsSync(path.join(this.root, 'ios'));
    return hasAndroid || hasiOS ? 'generic' : 'managed';
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
