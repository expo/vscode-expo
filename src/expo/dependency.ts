import { Node, findNodeAtLocation, getNodeValue } from 'jsonc-parser';
import fetch from 'node-fetch';
import { major as semverMajor } from 'semver';

import { MapCacheProvider } from '../utils/cache';

type Dependencies = Record<string, string>;

/**
 * Get all dependencies with their known compatible version ranges from the Expo API.
 * This fetches the latest versions from `exp.host/--/api/v2/versions`.
 */
async function getVersionedDependenciesFromAPI(sdkVersion: string): Promise<Dependencies> {
  return fetch(`https://api.expo.dev/v2/versions`)
    .then((response) => (response.ok ? response.json() : ({} as any)))
    .then((data) => data.sdkVersions?.[sdkVersion]?.relatedPackages ?? {});
}

/**
 * Get all dependencies with their known compatible version ranges from the `expo` package on unpkg.com.
 * This fetches the `expo/bundledNativeModules.json` file from unpkg.com.
 *
 * @note This method is called from `getVersionedDependenciesFromLocalExpo`, when the local package can't be used.
 */
async function getVersionedDependenciesFromUnpkg(sdkVersion: string): Promise<Dependencies> {
  const majorVersion = semverMajor(sdkVersion);
  return fetch(`https://unpkg.com/expo@${majorVersion}/bundledNativeModules.json`).then(
    (response) => (response.ok ? response.json() : ({} as any))
  );
}

/**
 * Get all dependencies with their known compatible version ranges.
 * This combines the local and remote (if possible) sources.
 */
export async function getVersionedDependencies(sdkVersion: string): Promise<Dependencies> {
  const [bundledDependencies, apiDependencies] = await Promise.allSettled([
    getVersionedDependenciesFromUnpkg(sdkVersion),
    getVersionedDependenciesFromAPI(sdkVersion),
  ]);

  return {
    ...(bundledDependencies.status === 'fulfilled' ? bundledDependencies.value : {}),
    ...(apiDependencies.status === 'fulfilled' ? apiDependencies.value : {}),
  };
}

/**
 * Resolve the expected Expo SDK version, based on the package file.
 * This tries to resolve the `expo` dependency value from the package file, listed under:
 *   - dependencies.expo
 *   - devDependencies.expo
 *   - paarDependencies.expo - TODO: might include handling for *
 */
export function getSdkVersion(packageTree: Node): string | undefined {
  const expoNode =
    findNodeAtLocation(packageTree, ['dependencies', 'expo']) ||
    findNodeAtLocation(packageTree, ['devDependencies', 'expo']);

  // TODO: add widlcard support for peerDependencies
  if (expoNode) {
    return getNodeValue(expoNode);
  }

  // TODO: Add support for resolving the SDK version based on expo package installed version (monorepos)

  return undefined;
}

/**
 * The Expo dependency cache keeps track of the fetched dependency list for each SDK version.
 */
export class ExpoDependencyCache extends MapCacheProvider<Dependencies, string> {
  async fromSdk(sdkVersion: string) {
    if (!this.cache.has(sdkVersion)) {
      const dependencies = await getVersionedDependencies(sdkVersion);

      if (Object.keys(dependencies).length > 0) {
        this.cache.set(sdkVersion, dependencies);
      }
    }

    return this.cache.get(sdkVersion);
  }

  async fromPackage(packageTree: Node) {
    const sdkVersion = getSdkVersion(packageTree); // TODO: convert to `{major}.0.0`
    if (sdkVersion) return this.fromSdk(sdkVersion);
    return undefined;
  }
}
