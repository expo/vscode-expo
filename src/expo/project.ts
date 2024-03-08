import findUp from 'find-up';
import * as jsonc from 'jsonc-parser';
import path from 'path';
import vscode from 'vscode';

import { MapCacheProvider } from '../utils/cache';
import { debug } from '../utils/debug';
import { readWorkspaceFile, relativeUri } from '../utils/file';

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
export async function findProjectFromWorkspaces(projects: ExpoProjectCache, relativePath?: string) {
  const workspaces = vscode.workspace.workspaceFolders ?? [];

  for (const workspace of workspaces) {
    const project = await findProjectFromWorkspace(projects, workspace, relativePath);
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
    ? projects.fromRoot(relativeUri(workspace.uri, relativePath))
    : projects.fromRoot(workspace.uri);
}

/**
 * The Expo project cache keeps track of resolved project information.
 * It's designed to work as "just-in-time"-resolving to avoid unnecessary heavy operations.
 *
 * For example, the `app.json` is only updated when it's requested through the `fromManifest`.
 * You can use `fromManifest` or `fromPackage` when providing document links or diagnostics.
 */
export class ExpoProjectCache extends MapCacheProvider<ExpoProject> {
  async fromPackage(pkg: vscode.TextDocument) {
    const project = await this.fromRoot(vscode.Uri.file(path.dirname(pkg.fileName)));
    project?.setPackage(pkg.getText());
    return project;
  }

  async fromManifest(manifest: vscode.TextDocument) {
    const root = getProjectRoot(manifest.fileName);
    const project = root ? await this.fromRoot(vscode.Uri.file(root)) : undefined;
    project?.setManifest(manifest.getText());
    return project;
  }

  async fromRoot(projectPath: vscode.Uri) {
    const cacheKey = projectPath.toString();
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const packagePath = relativeUri(projectPath, 'package.json');

    // Ensure the project has a `package.json` file
    const packageInfo = await vscode.workspace.fs.stat(packagePath);
    if (packageInfo.type !== vscode.FileType.File) {
      return undefined;
    }

    // Ensure the project has `expo` as dependency
    const packageFile = parseJsonFile(await readWorkspaceFile(packagePath));
    if (!packageFile || !jsonc.findNodeAtLocation(packageFile.tree, ['dependencies', 'expo'])) {
      return undefined;
    }

    const project = new ExpoProject(projectPath, packageFile);

    // Load the `app.json` or `app.config.json` file, if available
    for (const appFileName of ['app.json', 'app.config.json']) {
      const filePath = relativeUri(projectPath, appFileName);
      const fileStat = await vscode.workspace.fs.stat(filePath);
      if (fileStat.type === vscode.FileType.File) {
        project.setManifest(await readWorkspaceFile(filePath));
        break;
      }
    }

    this.cache.set(cacheKey, project);
    return project;
  }
}

export class ExpoProject {
  constructor(
    public readonly root: vscode.Uri,
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

  get expoVersion() {
    const version = jsonc.findNodeAtLocation(this.packageFile.tree, ['dependencies', 'expo']);
    return version?.type === 'string' ? version.value : undefined;
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

    // Allow `expo.*` properties, or `*` as root properties
    const file = parseJsonFile(content, ['expo']) ?? parseJsonFile(content);
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
