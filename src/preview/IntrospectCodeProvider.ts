import { getConfig } from '@expo/config';
import { compileModsAsync, IOSConfig, ModPlatform } from '@expo/config-plugins';
import { getPrebuildConfig } from '@expo/prebuild-config';
import assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';

import { BasicCodeProviderOptions, CodeProvider, CodeProviderLanguage } from './CodeProvider';

class IntrospectCodeProvider extends CodeProvider {
  getModName(): string {
    const modName = this.options.type.split('.')[1];
    assert(modName);
    return modName;
  }

  getModPlatform(): ModPlatform {
    const platform = this.options.type.split('.')[0];
    assert(
      ['ios', 'android'].includes(platform),
      `Platform must be one of: ios, android. Instead found: ${platform}`
    );
    return platform as ModPlatform;
  }

  getExpoConfig() {
    return getPrebuildConfig(this.projectRoot, {
      platforms: [this.getModPlatform()],
    }).exp;
  }

  async getFileContents() {
    const config = await compileModsAsync(this.getExpoConfig(), {
      projectRoot: this.projectRoot,
      introspect: true,
      platforms: [this.getModPlatform()],
    });

    const results = config._internal!.modResults[this.getModPlatform()][this.getModName()];
    return this.sortObject(results);
  }

  sortObject(obj: Record<string, any>): Record<string, any> {
    return sortObjectKeys(obj);
  }
}

function sortObjectKeys(
  obj: Record<string, any>,
  compareFn?: (a: string, b: string) => number
): Record<string, any> {
  return Object.keys(obj)
    .sort(compareFn)
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: obj[key],
      }),
      {}
    );
}

const reverseSort = (a: string, b: string) => {
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
};

export class AndroidManifestCodeProvider extends IntrospectCodeProvider {
  static fileDescription = 'android/app/src/main/AndroidManifest.xml';
  readonly defaultLanguage: CodeProviderLanguage = 'xml';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'android.manifest' });
  }

  getFileName(): string {
    return 'android/app/src/main/AndroidManifest.xml';
  }

  sortObject(obj: Record<string, any>): Record<string, any> {
    if (obj.manifest) {
      // Reverse sort so application is last and permissions are first
      obj.manifest = sortObjectKeys(obj.manifest, reverseSort);

      if (Array.isArray(obj.manifest.application)) {
        // reverse sort applications so activity is towards the end and meta-data is towards the front.
        obj.manifest.application = obj.manifest.application.map((application: any) =>
          sortObjectKeys(application, reverseSort)
        );
      }
    }
    return obj;
  }
}

export class GradlePropertiesCodeProvider extends IntrospectCodeProvider {
  static fileDescription = 'android/gradle.properties';
  readonly defaultLanguage: CodeProviderLanguage = 'properties';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, {
      ...options,
      type: 'android.gradleProperties',
    });
  }

  getFileName(): string {
    return 'android/gradle.properties';
  }
}

class AndroidResourceCodeProvider extends IntrospectCodeProvider {
  readonly defaultLanguage: CodeProviderLanguage = 'xml';

  getResourceFileName(): string {
    throw new Error(`getResourceFileName should be extended`);
  }

  getFileName(): string {
    return `android/app/src/main/res/values/${this.getResourceFileName()}`;
  }
}

export class AndroidStringsCodeProvider extends AndroidResourceCodeProvider {
  static fileDescription = 'android/app/src/main/res/values/strings.xml';
  readonly defaultLanguage: CodeProviderLanguage = 'xml';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'android.strings' });
  }

  getResourceFileName(): string {
    return 'strings.xml';
  }
}

export class AndroidColorsCodeProvider extends AndroidResourceCodeProvider {
  static fileDescription = 'android/app/src/main/res/values/colors.xml';
  readonly defaultLanguage: CodeProviderLanguage = 'xml';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'android.colors' });
  }

  getResourceFileName(): string {
    return 'colors.xml';
  }
}

export class AndroidStylesCodeProvider extends AndroidResourceCodeProvider {
  static fileDescription = 'android/app/src/main/res/values/styles.xml';
  readonly defaultLanguage: CodeProviderLanguage = 'xml';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'android.styles' });
  }

  getResourceFileName(): string {
    return 'styles.xml';
  }
}

export class InfoPlistCodeProvider extends IntrospectCodeProvider {
  static fileDescription = 'ios/[name]/Info.plist';
  readonly defaultLanguage: CodeProviderLanguage = 'plist';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, {
      ...options,
      type: 'ios.infoPlist',
    });
  }

  getFileName(): string {
    try {
      // custom
      const infoPlistPath = IOSConfig.Paths.getInfoPlistPath(this.projectRoot);
      return path.relative(this.projectRoot, infoPlistPath);
    } catch {
      // managed
      const config = getConfig(this.projectRoot, { skipSDKVersionRequirement: true }).exp;
      const iosName = IOSConfig.XcodeUtils.getHackyProjectName(this.projectRoot, config);
      return `ios/${iosName}/Info.plist`;
    }
  }
}

export class EntitlementsPlistCodeProvider extends IntrospectCodeProvider {
  static fileDescription = 'ios/[name]/[name].entitlements';

  readonly defaultLanguage: CodeProviderLanguage = 'entitlements';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'ios.entitlements' });
  }

  getFileName(): string {
    try {
      // custom
      const entitlementsPath = IOSConfig.Paths.getEntitlementsPath(this.projectRoot);
      if (!entitlementsPath) throw new Error('No entitlements');
      return path.relative(this.projectRoot, entitlementsPath);
    } catch {
      // managed
      const config = getConfig(this.projectRoot, { skipSDKVersionRequirement: true }).exp;
      const iosName = IOSConfig.XcodeUtils.getHackyProjectName(this.projectRoot, config);
      return `ios/${iosName}/${iosName}.entitlements`;
    }
  }
}

export class ExpoPlistCodeProvider extends IntrospectCodeProvider {
  static fileDescription = 'ios/[name]/Supporting/Expo.plist';

  readonly defaultLanguage: CodeProviderLanguage = 'plist';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'ios.expoPlist' });
  }

  getFileName(): string {
    try {
      // custom
      const expoPlist = IOSConfig.Paths.getExpoPlistPath(this.projectRoot);
      if (!expoPlist) throw new Error('No Expo.plist');
      return path.relative(this.projectRoot, expoPlist);
    } catch {
      // managed
      const config = getConfig(this.projectRoot, { skipSDKVersionRequirement: true }).exp;
      const iosName = IOSConfig.XcodeUtils.getHackyProjectName(this.projectRoot, config);
      return `ios/${iosName}/Supporting/Expo.plist`;
    }
  }
}
