import { getConfig } from '@expo/config';
import { compileModsAsync, AndroidConfig, XML } from '@expo/config-plugins';
import plist from '@expo/plist';
import { getPrebuildConfig } from '@expo/prebuild-config';
import * as clearModule from 'clear-module';
import * as path from 'path';
import * as vscode from 'vscode';
import { window } from 'vscode';

import { getProjectRoot } from '../utils/getProjectRoot';

type CodeProviderLanguage = 'json' | 'xml' | 'plist' | 'properties';

export enum ExpoConfigType {
  PREBUILD = 'prebuild',
  INTROSPECT = 'introspect',
  PUBLIC = 'public',
}

export type CodeProviderOptions = {
  fileName: string;
  convertLanguage?: CodeProviderLanguage;
  type: string;
};
const configurationSection = 'expo';

export class CodeProvider implements vscode.TextDocumentContentProvider {
  readonly scheme: string = 'expo-config';

  public fileContents = '';
  public projectRoot: string;

  public readonly _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  private readonly _changeSubscription: vscode.Disposable;
  private readonly _onDidChangeVisibleTextEditors: vscode.Disposable;
  private readonly _onDidChangeConfiguration: vscode.Disposable;

  public _isOpen = false;
  private _timer: NodeJS.Timer | undefined = undefined;

  readonly defaultLanguage: CodeProviderLanguage = 'json';

  constructor(public _document: vscode.TextDocument, public options: CodeProviderOptions) {
    this.scheme = `expo-config-${this.options.type}`;
    this.projectRoot = getProjectRoot(this._document);

    this._changeSubscription = vscode.workspace.onDidChangeTextDocument((ev) =>
      this.textDidChange(ev)
    );
    this._onDidChangeVisibleTextEditors = vscode.window.onDidChangeVisibleTextEditors((editors) =>
      this.visibleTextEditorsDidChange(editors)
    );
    this._onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration((ev) =>
      this.configurationDidChange(ev)
    );
  }

  getDefinedLanguage() {
    return this.options.convertLanguage || this.defaultLanguage;
  }

  getURI() {
    const { fileName, convertLanguage } = this.options;
    let outputFileName = fileName;
    const extension = path.extname(fileName).slice(1);
    if (extension !== this.defaultLanguage) {
      throw new Error('defaultLanguage should match fileName extension');
    }
    if (convertLanguage && convertLanguage !== this.defaultLanguage) {
      outputFileName += '.' + convertLanguage;
    }

    return vscode.Uri.parse(`${this.scheme}:${outputFileName}`);
  }

  formatWithLanguage(results: any, language?: CodeProviderLanguage) {
    language = language || this.options.convertLanguage || this.defaultLanguage;
    if (language === 'json') {
      return JSON.stringify(results, null, 2);
    } else if (language === 'xml') {
      return XML.format(results);
    } else if (language === 'plist') {
      return plist.build(results);
    } else if (language === 'properties') {
      return AndroidConfig.Properties.propertiesListToString(results);
    }
    throw new Error('Unknown language: ' + language);
  }

  sendDidChangeEvent() {
    if (!this._isOpen) return;
    this._onDidChange.fire(this.getURI());
  }

  dispose(): void {
    this._onDidChange.dispose();
    this._changeSubscription.dispose();
    this._onDidChangeVisibleTextEditors.dispose();
    this._onDidChangeConfiguration.dispose();
  }

  get document(): vscode.TextDocument {
    return this._document;
  }

  get documentName(): string {
    const basename = path.basename(this.document.fileName);
    const extIndex = basename.lastIndexOf('.');
    return extIndex === -1 ? basename : basename.substring(0, extIndex);
  }

  setDocument(document: vscode.TextDocument): void {
    this._document = document;
  }

  get onDidChange(): vscode.Event<vscode.Uri> {
    return this._onDidChange.event;
  }

  private visibleTextEditorsDidChange(editors: vscode.TextEditor[]) {
    const isOpen = editors.some((e) => e.document.uri.scheme === this.scheme);
    if (!this._isOpen && isOpen) {
      this.update();
    }
    this._isOpen = isOpen;
  }

  private configurationDidChange(ev: vscode.ConfigurationChangeEvent): void {
    if (ev.affectsConfiguration(configurationSection)) {
      this.update();
    }
  }

  private textDidChange(ev: vscode.TextDocumentChangeEvent): void {
    if (!this._isOpen) return;

    if (ev.document !== this._document) return;

    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._timer = setTimeout(() => {
      this._timer = undefined;
      this.update();
    }, 300);
  }

  async update(): Promise<void> {
    try {
      // Reset all requires to ensure plugins update
      clearModule.all();
      this.fileContents = this.formatWithLanguage(await this.getFileContents());
    } catch (error) {
      this.fileContents = '';
      window.showErrorMessage(error.message);
    }
    this.sendDidChangeEvent();
  }

  getExpoConfig() {}

  provideTextDocumentContent(
    _uri: vscode.Uri,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<string> {
    this._isOpen = true;

    return this.fileContents;
  }

  async getFileContents(): Promise<any> {
    return '';
  }
}
export class AndroidCodeProvider extends CodeProvider {
  getExpoConfig() {
    return getPrebuildConfig(this.projectRoot, {
      platforms: ['android'],
      // packageName: 'com.helloworld'
    }).exp;
  }
}

export class AndroidManifestCodeProvider extends AndroidCodeProvider {
  readonly defaultLanguage: CodeProviderLanguage = 'xml';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'android.manifest', fileName: 'AndroidManifest.xml' });
  }

  async getFileContents() {
    let config = this.getExpoConfig();
    config = await compileModsAsync(config, {
      projectRoot: this.projectRoot,
      introspect: true,
      platforms: ['android'],
    });
    return config._internal!.modResults.android.manifest;
  }
}

export class GradlePropertiesCodeProvider extends AndroidCodeProvider {
  readonly defaultLanguage: CodeProviderLanguage = 'properties';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, {
      ...options,
      type: 'android.gradleProperties',
      fileName: 'gradle.properties',
    });
  }

  async getFileContents() {
    let config = this.getExpoConfig();

    config = await compileModsAsync(config, {
      projectRoot: this.projectRoot,
      introspect: true,
      platforms: ['android'],
    });
    return config._internal!.modResults.android.gradleProperties;
  }
}

export class AndroidStringsCodeProvider extends AndroidCodeProvider {
  readonly defaultLanguage: CodeProviderLanguage = 'xml';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'android.strings', fileName: 'strings.xml' });
  }

  async getFileContents() {
    let config = this.getExpoConfig();

    config = await compileModsAsync(config, {
      projectRoot: this.projectRoot,
      introspect: true,
      platforms: ['android'],
    });
    const results = config._internal!.modResults.android.strings;

    return results;
  }
}

export class IOSCodeProvider extends CodeProvider {
  getExpoConfig() {
    return getPrebuildConfig(this.projectRoot, {
      platforms: ['ios'],
      // packageName: 'com.helloworld'
    }).exp;
  }
}

export class InfoPlistCodeProvider extends IOSCodeProvider {
  readonly defaultLanguage: CodeProviderLanguage = 'plist';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, {
      ...options,
      type: 'ios.infoPlist',
      fileName: `Info.plist`,
    });
  }

  async getFileContents() {
    let config = this.getExpoConfig();

    config = await compileModsAsync(config, {
      projectRoot: this.projectRoot,
      introspect: true,
      platforms: ['ios'],
    });
    const results = config._internal!.modResults.ios.infoPlist;

    return results;
  }
}
export class EntitlementsPlistCodeProvider extends IOSCodeProvider {
  readonly defaultLanguage: CodeProviderLanguage = 'plist';

  constructor(document: vscode.TextDocument, options: BasicCodeProviderOptions) {
    super(document, { ...options, type: 'ios.entitlements', fileName: 'entitlements.plist' });
  }

  async getFileContents() {
    let config = this.getExpoConfig();

    config = await compileModsAsync(config, {
      projectRoot: this.projectRoot,
      introspect: true,
      platforms: ['ios'],
    });

    return config._internal!.modResults.ios.entitlements;
  }
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
      // TODO: Maybe manifest.json is better?
      fileName: configType === ExpoConfigType.PUBLIC ? 'exp.json' : 'app.config.json',
    });
  }

  async getFileContents(): Promise<any> {
    return this.getExpoConfig();
  }
}

type BasicCodeProviderOptions = Pick<CodeProviderOptions, 'convertLanguage'>;

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
