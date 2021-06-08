import { getConfig } from '@expo/config';
import { compileModsAsync } from '@expo/config-plugins';
import { getPrebuildConfig } from '@expo/prebuild-config';
import * as vscode from 'vscode';

import { CodeProvider, BasicCodeProviderOptions, CodeProviderLanguage } from './CodeProvider';

export enum ExpoConfigType {
  PREBUILD = 'prebuild',
  INTROSPECT = 'introspect',
  PUBLIC = 'public',
}

export class ExpoConfigCodeProvider extends CodeProvider {
  readonly defaultLanguage: CodeProviderLanguage = 'json';

  constructor(
    public configType: ExpoConfigType,
    document: vscode.TextDocument,
    options: BasicCodeProviderOptions
  ) {
    super(document, {
      ...options,
      type: configType,
    });
  }

  getFileName() {
    // TODO: Maybe manifest.json is better?

    const name = this.configType === ExpoConfigType.PUBLIC ? 'exp.json' : 'app.config.json';
    return name;
  }

  async getFileContents(): Promise<any> {
    return this.getExpoConfig();
  }
}

export class IntrospectExpoConfigCodeProvider extends ExpoConfigCodeProvider {
  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(ExpoConfigType.INTROSPECT, document, options);
  }

  getExpoConfig() {
    return getPrebuildConfig(this.projectRoot, {
      platforms: ['ios', 'android'],
    }).exp;
  }

  async getFileContents() {
    let config = this.getExpoConfig();

    config = await compileModsAsync(config, {
      projectRoot: this.projectRoot,
      introspect: true,
      platforms: ['android', 'ios'],
    });
    return config;
  }
}

export class PublicExpoConfigCodeProvider extends ExpoConfigCodeProvider {
  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(ExpoConfigType.PUBLIC, document, options);
  }

  getExpoConfig() {
    return getConfig(this.projectRoot, {
      isPublicConfig: true,
      skipSDKVersionRequirement: true,
    }).exp;
  }
}

export class PrebuildExpoConfigCodeProvider extends ExpoConfigCodeProvider {
  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(ExpoConfigType.PREBUILD, document, options);
  }

  getExpoConfig() {
    return getPrebuildConfig(this.projectRoot, {
      platforms: ['ios', 'android'],
    }).exp;
  }
}
