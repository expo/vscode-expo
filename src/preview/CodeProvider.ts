import { AndroidConfig, XML } from '@expo/config-plugins';
import plist from '@expo/plist';
import * as path from 'path';
import * as vscode from 'vscode';

import { getProjectRoot } from '../expo/project';
import { debug } from '../utils/debug';
import { resetModulesFrom } from '../utils/module';

const log = debug.extend('preview-code-provider');

export type CodeProviderLanguage = 'json' | 'xml' | 'plist' | 'properties' | 'entitlements';

export type CodeProviderOptions = {
  convertLanguage?: CodeProviderLanguage;
  type: string;
};

const configurationSection = 'expo';

export type BasicCodeProviderOptions = Pick<CodeProviderOptions, 'convertLanguage'>;

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
  private _editor: vscode.TextEditor | null = null;

  readonly defaultLanguage: CodeProviderLanguage = 'json';

  constructor(
    public _document: vscode.TextDocument,
    public options: CodeProviderOptions
  ) {
    this.scheme = `expo-config-${this.options.type}`;
    this.projectRoot = getProjectRoot(this._document.fileName) ?? this._document.fileName;
    if (this.projectRoot === this._document.fileName) {
      log('Unable to find project root for %s', this._document.fileName);
    }

    this._changeSubscription = vscode.workspace.onDidChangeTextDocument((ev) => {
      this.textDidChange(ev);
      // Apply highlight to changed area
      if (this._editor && ev.document === this._editor.document) {
        const styles: vscode.DecorationOptions[] = [];
        for (const change of ev.contentChanges) {
          // Only style added lines
          if (!change.text || !change.range) {
            continue;
          }
          // Get the range of the modification
          const range = new vscode.Range(
            this._editor.document.positionAt(change.rangeOffset),
            this._editor.document.positionAt(change.rangeOffset + change.text.length)
          );
          styles.push({
            range,
          });
        }
        // Apply decorations (styles)
        this._editor.setDecorations(addedCodeStyle, styles);
      }
    });
    this._onDidChangeVisibleTextEditors = vscode.window.onDidChangeVisibleTextEditors((editors) =>
      this.visibleTextEditorsDidChange(editors)
    );
    this._onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration((ev) =>
      this.configurationDidChange(ev)
    );
  }

  setEditor(editor: vscode.TextEditor) {
    this._editor = editor;
  }

  getDefinedLanguage() {
    return this.options.convertLanguage || this.defaultLanguage;
  }

  /**
   * Where the preview file should be located.
   * The extension is used for code coloring, and having the file in the right location can enable the user to press cmd+s to save the file in place.
   */
  getFileName(): string {
    throw new Error('getFileName should be extended');
  }

  getURI() {
    const { convertLanguage } = this.options;
    let outputFileName = this.getFileName();
    const extension = path.extname(outputFileName).slice(1);
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
    switch (language) {
      case 'json':
        return JSON.stringify(results, null, 2);
      case 'xml':
        return XML.format(results);
      case 'plist':
      case 'entitlements':
        return plist.build(results);
      case 'properties':
        return AndroidConfig.Properties.propertiesListToString(results);
      default:
        throw new Error('Unknown language: ' + language);
    }
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
    return this.getFileName();
  }

  setDocument(document: vscode.TextDocument): void {
    this._document = document;
  }

  get onDidChange(): vscode.Event<vscode.Uri> {
    return this._onDidChange.event;
  }

  private visibleTextEditorsDidChange(editors: Readonly<vscode.TextEditor[]>) {
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
      resetModulesFrom(this.projectRoot);

      this.fileContents = this.formatWithLanguage(await this.getFileContents());
    } catch (error) {
      this.fileContents = '';
      vscode.window.showErrorMessage(error.message);
    }

    this.sendDidChangeEvent();
  }

  getExpoConfigAsync() {}

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

// create a decorator type that we use to decorate small numbers
const addedCodeStyle = vscode.window.createTextEditorDecorationType({
  //   before: {
  //     contentText: '+',
  //   },
  isWholeLine: true,
  backgroundColor: '#e5ffec',
  dark: {
    backgroundColor: '#2ea04333',
  },
});
