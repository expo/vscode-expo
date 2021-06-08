import { compileModsAsync, ModPlatform } from '@expo/config-plugins';
import { getPrebuildConfig } from '@expo/prebuild-config';
import assert from 'assert';
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

    return config._internal!.modResults[this.getModPlatform()][this.getModName()];
  }
}

export class AndroidManifestCodeProvider extends IntrospectCodeProvider {
  static fileDescription = 'android/app/src/main/AndroidManifest.xml';
  readonly defaultLanguage: CodeProviderLanguage = 'xml';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'android.manifest' });
  }

  getFileName(): string {
    return 'android/app/src/main/AndroidManifest.xml';
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
