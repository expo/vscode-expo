import vscode from 'vscode';

import { CodeProvider, BasicCodeProviderOptions, CodeProviderLanguage } from './CodeProvider';
import { ExpoConfigType } from './constants';
import { loadConfig } from '../packages/config';
import { loadConfigPluginsModCompiler } from '../packages/config-plugins';
import { loadPrebuildConfig } from '../packages/prebuild-config';

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
    const { getPrebuildConfigAsync } = loadPrebuildConfig(this.projectRoot);
    return await getPrebuildConfigAsync(this.projectRoot, { platforms: ['ios', 'android'] }).then(
      (config) => config.exp
    );
  }

  async getFileContents() {
    const { compileModsAsync } = loadConfigPluginsModCompiler(this.projectRoot);
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
    const { getConfig } = loadConfig(this.projectRoot);
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
    const { getPrebuildConfigAsync } = loadPrebuildConfig(this.projectRoot);
    return await getPrebuildConfigAsync(this.projectRoot, { platforms: ['ios', 'android'] }).then(
      (config) => config.exp
    );
  }
}
