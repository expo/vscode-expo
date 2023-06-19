import * as vscode from 'vscode';

import { loadExpoConfig, loadExpoConfigPlugins, loadExpoPrebuildConfig } from '../expo/packages';
import { withWorkingDirectory } from '../utils/process';
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

    // Use _app.config.json to disable all features like auto complete and intellisense on the file.
    const name = this.configType === ExpoConfigType.PUBLIC ? 'exp.json' : '_app.config.json';
    return name;
  }

  async getFileContents(): Promise<any> {
    return await this.getExpoConfigAsync();
  }
}

export class IntrospectExpoConfigCodeProvider extends ExpoConfigCodeProvider {
  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(ExpoConfigType.INTROSPECT, document, options);
  }

  async getExpoConfigAsync() {
    const { getPrebuildConfigAsync } = loadExpoPrebuildConfig(this.projectRoot);

    // NOTE(cedric): `expo-modules-autolinking` is using `process.cwd()` as project root
    return await withWorkingDirectory(this.projectRoot, () =>
      getPrebuildConfigAsync(this.projectRoot, { platforms: ['ios', 'android'] }).then(
        (config) => config.exp
      )
    );
  }

  async getFileContents() {
    const { compileModsAsync } = loadExpoConfigPlugins(this.projectRoot);
    const config = await this.getExpoConfigAsync();

    return await compileModsAsync(config, {
      projectRoot: this.projectRoot,
      introspect: true,
      platforms: ['android', 'ios'],
    });
  }
}

export class PublicExpoConfigCodeProvider extends ExpoConfigCodeProvider {
  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(ExpoConfigType.PUBLIC, document, options);
  }

  getExpoConfigAsync() {
    const { getConfig } = loadExpoConfig(this.projectRoot);

    return Promise.resolve(
      getConfig(this.projectRoot, {
        isPublicConfig: true,
        skipSDKVersionRequirement: true,
      }).exp
    );
  }
}

export class PrebuildExpoConfigCodeProvider extends ExpoConfigCodeProvider {
  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(ExpoConfigType.PREBUILD, document, options);
  }

  async getExpoConfigAsync() {
    const { getPrebuildConfigAsync } = loadExpoPrebuildConfig(this.projectRoot);

    // NOTE(cedric): `expo-modules-autolinking` is using `process.cwd()` as project root
    return await withWorkingDirectory(this.projectRoot, () =>
      getPrebuildConfigAsync(this.projectRoot, { platforms: ['ios', 'android'] }).then(
        (config) => config.exp
      )
    );
  }
}
