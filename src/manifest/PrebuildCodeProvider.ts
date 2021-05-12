import { getConfig, getPrebuildConfig } from '@expo/config';
import path from 'path';
import vscode from 'vscode';

import {
  compileEntitlementsPlistMockAsync,
  compileInfoPlistMockAsync,
  compileManifestMockAsync,
} from './mockModCompiler';
import { getProjectRoot } from './utils/getProjectRoot';

export class CodeProvider implements vscode.TextDocumentContentProvider {
  readonly scheme: string = 'expo-config';
  readonly uri: vscode.Uri;

  public _documentText: string = '';
  public _targetCode = '';
  public projectRoot: string;

  public readonly _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  private readonly _changeSubscription: vscode.Disposable;
  private readonly _onDidChangeVisibleTextEditors: vscode.Disposable;
  private readonly _onDidChangeConfiguration: vscode.Disposable;

  public _isOpen = false;
  private _timer: NodeJS.Timer | undefined = undefined;

  constructor(
    public _type: string,
    public _document: vscode.TextDocument,
    private fileName: string
  ) {
    this.scheme = `expo-config-${this._type}`;
    this.projectRoot = getProjectRoot(this._document);

    this.uri = vscode.Uri.parse(`${this.scheme}:${this.fileName}`);

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
    this._documentText = this._document.getText();
    try {
      const projectRoot = getProjectRoot(this._document);

      try {
        let config: any;
        if (this._type === 'manifest') {
          config = getConfig(projectRoot, {
            skipSDKVersionRequirement: true,
            isPublicConfig: true,
          }).exp;
        } else if (this._type === 'prebuild') {
          config = getConfig(projectRoot, {
            skipSDKVersionRequirement: true,
            isModdedConfig: true,
          }).exp;
        } else {
          config = getConfig(projectRoot, {
            skipSDKVersionRequirement: true,
          }).exp;
        }

        this._targetCode = JSON.stringify(config, null, 2);
      } catch (error) {
        console.log('update: ', error);
        this._targetCode = '';
      }
      if (!this._isOpen) return;
      this._onDidChange.fire(this.uri);
    } catch (e) {}
  }

  getExpoConfig() {
    if (this._type === 'manifest') {
      return getConfig(this.projectRoot, {
        skipSDKVersionRequirement: true,
        isPublicConfig: true,
      }).exp;
    } else if (this._type === 'prebuild') {
      // config = getConfig(projectRoot, {
      //   skipSDKVersionRequirement: true,
      //   isModdedConfig: true,
      // }).exp;
      return getPrebuildConfig(this.projectRoot, {
        platforms: ['android', 'ios'],
      }).exp;
    } else {
      return getConfig(this.projectRoot, {
        skipSDKVersionRequirement: true,
      }).exp;
    }
  }

  provideTextDocumentContent(
    _uri: vscode.Uri,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<string> {
    this._isOpen = true;

    return this._targetCode;
  }
}

export class AndroidManifestCodeProvider extends CodeProvider {
  constructor(_document: vscode.TextDocument) {
    super('prebuild', _document, 'AndroidManifest.xml');
  }

  getExpoConfig() {
    return getPrebuildConfig(this.projectRoot, {
      platforms: ['android'],
      // packageName: 'com.helloworld'
    }).exp;
  }

  async update(): Promise<void> {
    this._documentText = this._document.getText();
    try {
      try {
        const config = this.getExpoConfig();
        this._targetCode = await compileManifestMockAsync(this.projectRoot, config);
      } catch (error) {
        this._targetCode = '';
      }
      if (!this._isOpen) return;
      this._onDidChange.fire(this.uri);
    } catch (e) {}
  }
}

export class IOSCodeProvider extends CodeProvider {
  constructor(_document: vscode.TextDocument, name: string) {
    super('prebuild', _document, name);
  }

  getExpoConfig() {
    return getPrebuildConfig(this.projectRoot, {
      platforms: ['ios'],
      // packageName: 'com.helloworld'
    }).exp;
  }
}

export class InfoPlistCodeProvider extends IOSCodeProvider {
  constructor(_document: vscode.TextDocument) {
    super(_document, 'Info.plist');
  }

  async update(): Promise<void> {
    this._documentText = this._document.getText();
    try {
      try {
        const config = this.getExpoConfig();
        this._targetCode = await compileInfoPlistMockAsync(this.projectRoot, config);
      } catch (error) {
        this._targetCode = '';
      }
      if (!this._isOpen) return;
      this._onDidChange.fire(this.uri);
    } catch (e) {}
  }
}
export class EntitlementsPlistCodeProvider extends IOSCodeProvider {
  constructor(_document: vscode.TextDocument) {
    super(_document, 'entitlements.plist');
  }

  async update(): Promise<void> {
    this._documentText = this._document.getText();
    try {
      try {
        const config = this.getExpoConfig();
        this._targetCode = await compileEntitlementsPlistMockAsync(this.projectRoot, config);
      } catch (error) {
        this._targetCode = '';
      }
      if (!this._isOpen) return;
      this._onDidChange.fire(this.uri);
    } catch (e) {}
  }
}

const configurationSection = 'expo';
