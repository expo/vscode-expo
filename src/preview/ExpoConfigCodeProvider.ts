import vscode from 'vscode';

import { CodeProvider, type BasicCodeProviderOptions, CodeProviderLanguage } from './CodeProvider';
import { ExpoConfigType } from './constants';
import { spawnExpoCli } from '../expo/cli';
import { type ExpoConfig, getConfig } from '../packages/config';
import { compileModsAsync } from '../packages/config-plugins';
import { getPrebuildConfigAsync } from '../packages/prebuild-config';

export abstract class ExpoConfigCodeProvider extends CodeProvider {
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

  /** Get the generated contents of the file being previewed */
  abstract getFileContents(): Promise<string | object>;

  getFileName() {
    // TODO: Maybe manifest.json is better?

    // Use _app.config.json to disable all features like auto complete and intellisense on the file.
    const name = this.configType === ExpoConfigType.PUBLIC ? 'exp.json' : '_app.config.json';
    return name;
  }
}

export class IntrospectExpoConfigCodeProvider extends ExpoConfigCodeProvider {
  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(ExpoConfigType.INTROSPECT, document, options);
  }

  async getExpoConfigAsync() {
    return await getPrebuildConfigAsync(this.projectRoot, { platforms: ['ios', 'android'] }).then(
      (config) => config.exp
    );
  }

  async getFileContents() {
    let config: ExpoConfig;

    try {
      const result = await spawnExpoCli('config', ['--json', '--type', 'introspect'], {
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

    return config;
  }
}

export class PublicExpoConfigCodeProvider extends ExpoConfigCodeProvider {
  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(ExpoConfigType.PUBLIC, document, options);
  }

  async getFileContents() {
    let config: ExpoConfig;

    try {
      const result = await spawnExpoCli('config', ['--json', '--type', 'public'], {
        cwd: this.projectRoot,
      });

      config = JSON.parse(result);
    } catch (error: any) {
      console.warn('Cannot load the public config from project, using bundled package instead.');
      console.warn(`Reason: ${error.message} (${error.code})`);

      config = getConfig(this.projectRoot, {
        isPublicConfig: true,
        skipSDKVersionRequirement: true,
      }).exp;
    }

    return config;
  }
}

export class PrebuildExpoConfigCodeProvider extends ExpoConfigCodeProvider {
  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(ExpoConfigType.PREBUILD, document, options);
  }

  async getFileContents() {
    let config: ExpoConfig;

    try {
      const result = await spawnExpoCli('config', ['--json', '--type', 'prebuild'], {
        cwd: this.projectRoot,
      });

      config = JSON.parse(result);
    } catch (error: any) {
      console.warn('Cannot load the prebuild config from project, using bundled package instead.');
      console.warn(`Reason: ${error.message} (${error.code})`);

      config = await getPrebuildConfigAsync(this.projectRoot, {
        platforms: ['ios', 'android'],
      }).then((prebuildConfig) => prebuildConfig.exp);
    }

    return config;
  }
}
