import assert from 'assert';
import vscode from 'vscode';

import { BasicCodeProviderOptions, CodeProvider, CodeProviderLanguage } from './CodeProvider';
import { execExpoCli } from '../expo/cli';
import { ExpoConfig } from '../packages/config';
import { type ModPlatform, compileModsAsync } from '../packages/config-plugins';
import { getPrebuildConfigAsync } from '../packages/prebuild-config';

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

  async getExpoConfigAsync() {
    return await getPrebuildConfigAsync(this.projectRoot, {
      platforms: [this.getModPlatform()],
    }).then((config) => config.exp);
  }

  async getFileContents() {
    let config: ExpoConfig;

    try {
      const result = execExpoCli('config', ['--json', '--type', 'introspect'], {
        cwd: this.projectRoot,
      });

      config = JSON.parse(result);
    } catch (error: any) {
      console.warn(
        'Cannot load the introspected config from project, using bundled package instead.'
      );
      console.warn(`Reason: ${error.message} (${error.code})`);

      config = await compileModsAsync(await this.getExpoConfigAsync(), {
        projectRoot: this.projectRoot,
        platforms: ['android', 'ios'],
        introspect: true,
      });
    }

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

export class AndroidColorsNightCodeProvider extends AndroidResourceCodeProvider {
  static fileDescription = 'android/app/src/main/res/values-night/colors.xml';
  readonly defaultLanguage: CodeProviderLanguage = 'xml';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'android.colorsNight' });
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
    // Don't use app name in path because the file won't update if the URI changes.
    return `Info.plist`;
  }
}

export class EntitlementsPlistCodeProvider extends IntrospectCodeProvider {
  static fileDescription = 'ios/[name]/[name].entitlements';

  readonly defaultLanguage: CodeProviderLanguage = 'entitlements';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'ios.entitlements' });
  }

  getFileName(): string {
    // Don't use app name in path because the file won't update if the URI changes.
    return `Example.entitlements`;
  }
}

export class ExpoPlistCodeProvider extends IntrospectCodeProvider {
  static fileDescription = 'ios/[name]/Supporting/Expo.plist';

  readonly defaultLanguage: CodeProviderLanguage = 'plist';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'ios.expoPlist' });
  }

  getFileName(): string {
    // Don't use app name in path because the file won't update if the URI changes.
    return 'Expo.plist';
  }
}

export class PodfilePropertiesCodeProvider extends IntrospectCodeProvider {
  static fileDescription = 'ios/Podfile.properties.json';

  readonly defaultLanguage: CodeProviderLanguage = 'json';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'ios.podfileProperties' });
  }

  getFileName(): string {
    return 'Podfile.properties.json';
  }
}
