import {
  AndroidManifest,
  AndroidConfig,
  ConfigPlugin,
  ExportedConfigWithProps,
  withInterceptedMod,
  ExportedConfig,
  XML,
  ModConfig,
  ModPlatform,
} from '@expo/config-plugins';
import * as BaseMods from '@expo/config-plugins/build/plugins/compiler-plugins';
import { evalModsAsync } from '@expo/config-plugins/build/plugins/mod-compiler';
import plist from '@expo/plist';

// Adding a function to a plugin is invalid
export const withAndroidManifestBaseMod: ConfigPlugin = (config) => {
  // Append a rule to supply AndroidManifest.xml data to mods on `mods.android.manifest`
  return withInterceptedMod<AndroidManifest>(config, {
    platform: 'android',
    mod: 'manifest',
    skipEmptyMod: false,
    async action({ modRequest: { nextMod, ...modRequest }, ...config }) {
      let results: ExportedConfigWithProps<AndroidManifest> = {
        ...config,
        modRequest,
      };

      try {
        const filePath = await AndroidConfig.Paths.getAndroidManifestAsync(modRequest.projectRoot);
        let modResults = await AndroidConfig.Manifest.readAndroidManifestAsync(filePath);

        results = await nextMod!({
          ...config,
          modResults,
          modRequest,
        });
        //   resolveModResults(results, modRequest.platform, modRequest.modName);
        modResults = results.modResults;

        if (!results._internal) results._internal = {};
        if (!results._internal.modResults) results._internal.modResults = {};
        if (!results._internal.modResults.android) results._internal.modResults.android = {};

        results._internal.modResults.android.manifest = modResults;
      } catch (error) {
        console.error(`AndroidManifest.xml mod error:`);
        throw error;
      }
      return results;
    },
  });
};

export function clearMods(config: ExportedConfig, platform: 'ios' | 'android', modNames: string[]) {
  // Delete all mods that don't have noPersist options.

  const mods = (config as any).mods as ModConfig;

  for (const platformKey of Object.keys(mods)) {
    if (platformKey !== platform) {
      // @ts-ignore
      delete mods[platformKey];
    }
  }
  // @ts-ignore
  for (const key of Object.keys(mods[platform])) {
    if (!modNames.includes(key)) {
      // @ts-ignore
      delete mods[platform][key];
    }
  }
}

export async function compileManifestMockAsync(projectRoot: string, exp: ExportedConfig) {
  exp = withAndroidManifestBaseMod(exp);
  exp = await evalSinglePlatformModsAsync(projectRoot, exp, 'android', 'manifest');
  return XML.format(exp._internal!.modResults.android.manifest);
}

export async function compileInfoPlistMockAsync(projectRoot: string, exp: ExportedConfig) {
  // @ts-ignore
  exp = BaseMods.withIOSInfoPlistBaseMod(exp, { noPersist: true, saveToInternal: true });
  exp = await evalSinglePlatformModsAsync(projectRoot, exp, 'ios', 'infoPlist');
  return plist.build(exp._internal!.modResults.ios.infoPlist);
}

export async function compileEntitlementsPlistMockAsync(projectRoot: string, exp: ExportedConfig) {
  // @ts-ignore
  exp = BaseMods.withIOSEntitlementsPlistBaseMod(exp, { noPersist: true, saveToInternal: true });
  exp = await evalSinglePlatformModsAsync(projectRoot, exp, 'ios', 'entitlements');
  return plist.build(exp._internal!.modResults.ios.entitlements);
}

export async function evalSinglePlatformModsAsync(
  projectRoot: string,
  exp: ExportedConfig,
  platform: ModPlatform,
  modName: string
) {
  clearMods(exp, platform, [modName]);
  return await evalModsAsync(exp, {
    projectRoot,
    platforms: [platform],
  });
}
