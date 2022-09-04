import { parse } from 'jsonc-parser';
import fetch from 'node-fetch';
import resolveFrom from 'resolve-from';
import semver from 'semver';
import { TextDecoder } from 'util';
import { Uri, workspace } from 'vscode';

export async function getExpoSdkVersion(projectRoot: string): Promise<string | undefined> {
  const expoPath = resolveFrom.silent(projectRoot, 'expo/package.json');
  if (!expoPath) {
    return undefined;
  }

  const expoBuffer = await workspace.fs.readFile(Uri.file(expoPath));
  const expoData = parse(new TextDecoder().decode(expoBuffer));
  if (!expoData) {
    return undefined;
  }

  return `${semver.major(expoData.version)}.0.0`;
}

export async function getVersionedDependencies(
  projectRoot: string,
  sdkVersion: string
): Promise<Record<string, string>> {
  const [localDependencies, remoteDependencies] = await Promise.all([
    fetchLocalVersionedDependencies(projectRoot).catch(() => ({})),
    fetchRemoteVersionedDependencies(sdkVersion).catch(() => ({})),
  ]);

  return {
    ...remoteDependencies,
    ...localDependencies,
  };
}

async function fetchRemoteVersionedDependencies(sdkVersion: string) {
  return fetch(`https://exp.host/--/api/v2/versions`)
    .then((response) => response.json())
    .then((data) => data.sdkVersions[sdkVersion].relatedPackages ?? {});
}

async function fetchLocalVersionedDependencies(projectRoot: string) {
  const dependenciesPath = resolveFrom.silent(projectRoot, 'expo/bundledNativeModules.json');
  if (!dependenciesPath) {
    return {};
  }

  const dependenciesBuffer = await workspace.fs.readFile(Uri.file(dependenciesPath));
  const dependenciesData = new TextDecoder().decode(dependenciesBuffer);

  return parse(dependenciesData) ?? {};
}
