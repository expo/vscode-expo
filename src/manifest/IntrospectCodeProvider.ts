import { getPrebuildConfig } from '@expo/prebuild-config';
import { getConfig } from '@expo/config';
import { compileModsAsync, AndroidConfig, XML } from '@expo/config-plugins';
import plist from '@expo/plist';
import * as clearModule from 'clear-module';
import * as path from 'path';
import * as vscode from 'vscode';
import { window } from 'vscode';

import { compileEntitlementsPlistMockAsync } from './mockModCompiler';
import { getProjectRoot } from './utils/getProjectRoot';

type CodeProviderLanguage = 'json' | 'xml' | 'plist' | 'properties';

export type CodeProviderOptions = {
  fileName: string;
  convertLanguage?: CodeProviderLanguage;
  type: string;
};
export class CodeProvider implements vscode.TextDocumentContentProvider {
  readonly scheme: string = 'expo-config';

  public _targetCode = '';
  public projectRoot: string;

  public readonly _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  private readonly _changeSubscription: vscode.Disposable;
  private readonly _onDidChangeVisibleTextEditors: vscode.Disposable;
  private readonly _onDidChangeConfiguration: vscode.Disposable;

  public _isOpen = false;
  private _timer: NodeJS.Timer | undefined = undefined;

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

  constructor(public _document: vscode.TextDocument, public options: CodeProviderOptions) {
    this.scheme = `expo-config-${this.options.type}`;
    this.projectRoot = getProjectRoot(this._document);

    this._changeSubscription = vscode.workspace.onDidChangeTextDocument((ev) => {
      this.textDidChange(ev);
    });
    this._onDidChangeVisibleTextEditors = vscode.window.onDidChangeVisibleTextEditors((editors) =>
      this.visibleTextEditorsDidChange(editors)
    );
    this._onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration((ev) =>
      this.configurationDidChange(ev)
    );
  }

  readonly defaultLanguage: CodeProviderLanguage = 'json';

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

  async update(): Promise<void> {}

  getExpoConfig() {}

  provideTextDocumentContent(
    _uri: vscode.Uri,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<string> {
    this._isOpen = true;

    return this._targetCode;
  }
}
export class AndroidCodeProvider extends CodeProvider {
  getExpoConfig() {
    // Reset all requires to ensure plugins update
    clearModule.all();
    return getPrebuildConfig(this.projectRoot, {
      platforms: ['android'],
      // packageName: 'com.helloworld'
    }).exp;
  }
}

export class AndroidManifestCodeProvider extends AndroidCodeProvider {
  constructor(
    document: vscode.TextDocument,
    options: Pick<CodeProviderOptions, 'convertLanguage'>
  ) {
    super(document, { ...options, type: 'android.manifest', fileName: 'AndroidManifest.xml' });
  }
  readonly defaultLanguage: CodeProviderLanguage = 'xml';

  async update(): Promise<void> {
    try {
      const config = this.getExpoConfig();
      const exp = await compileModsAsync(config, {
        projectRoot: this.projectRoot,
        introspect: true,
        platforms: ['android'],
      });
      const results = exp._internal!.modResults.android.manifest;
      this._targetCode = this.formatWithLanguage(results);
    } catch (error) {
      this._targetCode = '';
      window.showErrorMessage(error.message);
    }
    this.sendDidChangeEvent();
  }
}

export class GradlePropertiesCodeProvider extends AndroidCodeProvider {
  constructor(
    document: vscode.TextDocument,
    options: Pick<CodeProviderOptions, 'convertLanguage'>
  ) {
    super(document, {
      ...options,
      type: 'android.gradleProperties',
      fileName: 'gradle.properties',
    });
  }
  readonly defaultLanguage: CodeProviderLanguage = 'properties';

  async update(): Promise<void> {
    try {
      let config = this.getExpoConfig();

      config = await compileModsAsync(config, {
        projectRoot: this.projectRoot,
        introspect: true,
        platforms: ['android'],
      });
      const results = config._internal!.modResults.android.gradleProperties;
      this._targetCode = this.formatWithLanguage(results);
    } catch (error) {
      this._targetCode = '';
      window.showErrorMessage(error.message + '\n' + error.stack);
    }
    this.sendDidChangeEvent();
  }
}

export class AndroidStringsCodeProvider extends AndroidCodeProvider {
  constructor(
    document: vscode.TextDocument,
    options: Pick<CodeProviderOptions, 'convertLanguage'>
  ) {
    super(document, { ...options, type: 'android.strings', fileName: 'strings.xml' });
  }
  readonly defaultLanguage: CodeProviderLanguage = 'xml';

  async update(): Promise<void> {
    try {
      let config = this.getExpoConfig();

      config = await compileModsAsync(config, {
        projectRoot: this.projectRoot,
        introspect: true,
        platforms: ['android'],
      });
      const results = config._internal!.modResults.android.strings;

      this._targetCode = this.formatWithLanguage(results);
    } catch (error) {
      this._targetCode = '';
      window.showErrorMessage(error.message);
    }
    this.sendDidChangeEvent();
  }
}

export class IOSCodeProvider extends CodeProvider {
  getExpoConfig() {
    // Reset all requires to ensure plugins update
    clearModule.all();
    return getPrebuildConfig(this.projectRoot, {
      platforms: ['ios'],
      // packageName: 'com.helloworld'
    }).exp;
  }
}

export class InfoPlistCodeProvider extends IOSCodeProvider {
  constructor(
    document: vscode.TextDocument,
    options: Pick<CodeProviderOptions, 'convertLanguage'>
  ) {
    super(document, {
      ...options,
      type: 'ios.infoPlist',
      fileName: `Info.plist`,
    });
  }
  readonly defaultLanguage: CodeProviderLanguage = 'plist';

  async update(): Promise<void> {
    try {
      let config = this.getExpoConfig();

      config = await compileModsAsync(config, {
        projectRoot: this.projectRoot,
        introspect: true,
        platforms: ['ios'],
      });
      const results = config._internal!.modResults.ios.infoPlist;
      this._targetCode = this.formatWithLanguage(results);
    } catch (error) {
      this._targetCode = '';
      window.showErrorMessage(error.message);
    }
    this.sendDidChangeEvent();
  }
}
export class EntitlementsPlistCodeProvider extends IOSCodeProvider {
  constructor(
    document: vscode.TextDocument,
    options: Pick<CodeProviderOptions, 'convertLanguage'>
  ) {
    super(document, { ...options, type: 'ios.entitlements', fileName: 'entitlements.plist' });
  }
  readonly defaultLanguage: CodeProviderLanguage = 'plist';

  async update(): Promise<void> {
    try {
      const config = this.getExpoConfig();
      const results = await compileEntitlementsPlistMockAsync(this.projectRoot, config);
      this._targetCode = this.formatWithLanguage(results);
    } catch (error) {
      this._targetCode = '';
      window.showErrorMessage(error.message);
    }
    this.sendDidChangeEvent();
  }
}

export enum ExpoConfigType {
  PREBUILD = 'prebuild',
  INTROSPECT = 'introspect',
  PUBLIC = 'public',
}

export class ExpoConfigCodeProvider extends CodeProvider {
  constructor(
    public configType: ExpoConfigType,
    document: vscode.TextDocument,
    options: Pick<CodeProviderOptions, 'convertLanguage'>
  ) {
    super(document, {
      ...options,
      type: configType,
      // TODO: Maybe manifest.json is better?
      fileName: configType === ExpoConfigType.PUBLIC ? 'exp.json' : 'app.config.json',
    });
  }

  readonly defaultLanguage: CodeProviderLanguage = 'json';

  getExpoConfig() {
    // Reset all requires to ensure plugins update
    clearModule.all();
    let config = getPrebuildConfig(this.projectRoot, {
      platforms: ['ios', 'android'],
      // packageName: 'com.helloworld'
    }).exp;

    return config;
  }

  async update(): Promise<void> {
    try {
      let config = this.getExpoConfig();

      config = await compileModsAsync(config, {
        projectRoot: this.projectRoot,
        introspect: true,
        platforms: ['android', 'ios'],
      });
      this._targetCode = this.formatWithLanguage(config);
    } catch (error) {
      this._targetCode = '';
      window.showErrorMessage(error.message);
    }
    this.sendDidChangeEvent();
  }
}

const configurationSection = 'expo';

export class IntrospectExpoConfigCodeProvider extends ExpoConfigCodeProvider {
  constructor(
    document: vscode.TextDocument,
    options: Pick<CodeProviderOptions, 'convertLanguage'>
  ) {
    super(ExpoConfigType.INTROSPECT, document, options);
  }

  readonly defaultLanguage: CodeProviderLanguage = 'json';

  getExpoConfig() {
    // Reset all requires to ensure plugins update
    clearModule.all();
    let config = getPrebuildConfig(this.projectRoot, {
      platforms: ['ios', 'android'],
      // packageName: 'com.helloworld'
    }).exp;

    return config;
  }
  async update(): Promise<void> {
    try {
      let config = this.getExpoConfig();

      config = await compileModsAsync(config, {
        projectRoot: this.projectRoot,
        introspect: true,
        platforms: ['android', 'ios'],
      });
      this._targetCode = this.formatWithLanguage(config);
    } catch (error) {
      this._targetCode = '';
      window.showErrorMessage(error.message);
    }
    this.sendDidChangeEvent();
  }
}
export class PublicExpoConfigCodeProvider extends ExpoConfigCodeProvider {
  constructor(
    document: vscode.TextDocument,
    options: Pick<CodeProviderOptions, 'convertLanguage'>
  ) {
    super(ExpoConfigType.PUBLIC, document, options);
  }

  readonly defaultLanguage: CodeProviderLanguage = 'json';

  getExpoConfig() {
    // Reset all requires to ensure plugins update
    clearModule.all();
    const config = getConfig(this.projectRoot, {
      isPublicConfig: true,
      skipSDKVersionRequirement: true,
    }).exp;
    return config;
  }
  async update(): Promise<void> {
    try {
      const config = this.getExpoConfig();
      this._targetCode = this.formatWithLanguage(config);
    } catch (error) {
      this._targetCode = '';
      window.showErrorMessage(error.message);
    }
    this.sendDidChangeEvent();
  }
}

export class PrebuildExpoConfigCodeProvider extends ExpoConfigCodeProvider {
  constructor(
    document: vscode.TextDocument,
    options: Pick<CodeProviderOptions, 'convertLanguage'>
  ) {
    super(ExpoConfigType.PREBUILD, document, options);
  }

  readonly defaultLanguage: CodeProviderLanguage = 'json';

  getExpoConfig() {
    // Reset all requires to ensure plugins update
    clearModule.all();
    let config = getPrebuildConfig(this.projectRoot, {
      platforms: ['ios', 'android'],
      // packageName: 'com.helloworld'
    }).exp;

    return config;
  }
  async update(): Promise<void> {
    try {
      const config = this.getExpoConfig();
      this._targetCode = this.formatWithLanguage(config);
    } catch (error) {
      this._targetCode = '';
      window.showErrorMessage(error.message);
    }
    this.sendDidChangeEvent();
  }
}
