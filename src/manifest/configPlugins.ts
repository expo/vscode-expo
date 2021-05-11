import {
  resolveConfigPluginFunction,
  resolveConfigPluginFunctionWithInfo,
} from '@expo/config-plugins/build/utils/plugin-resolver';
import { getConfig } from '@expo/config';

import path from 'path';
import vscode, {
  Diagnostic,
  DiagnosticCollection,
  DiagnosticSeverity,
  DocumentLink,
  languages,
  Range,
  TextDocument,
  Uri,
  window,
  workspace,
} from 'vscode';

import { isConfigPluginValidationEnabled } from './settings';
import { ThrottledDelayer } from './utils/async';
import { getProjectRoot } from './utils/getProjectRoot';
import {
  iteratePluginNames,
  JsonRange,
  parseSourceRanges,
  PluginRange,
} from './utils/iteratePlugins';
import { appJsonPattern, isAppJson, parseExpoJson } from './utils/parseExpoJson';
import { ExportedConfig } from '@expo/config-plugins';

let diagnosticCollection: DiagnosticCollection | null = null;
let delayer: ThrottledDelayer<void> | null = null;

export function setupDefinition() {
  // Enables jumping to source
  vscode.languages.registerDocumentLinkProvider(appJsonPattern, {
    provideDocumentLinks(document) {
      // Ensure we get the expo object if it exists.
      const { node } = parseExpoJson(document.getText());
      const links: vscode.DocumentLink[] = [];
      const projectRoot = getProjectRoot(document);
      iteratePluginNames(node, (resolver) => {
        try {
          const { pluginFile } = resolveConfigPluginFunctionWithInfo(
            projectRoot,
            resolver.nameValue
          );
          const linkUri = Uri.parse(pluginFile);
          const range = rangeForOffset(document, resolver.name);
          const link = new DocumentLink(range, linkUri);
          link.tooltip = 'Go to config plugin';
          links.push(link);
        } catch {
          // Invalid plugin.
          // This should be formatted by validation
        }
      });
      return links;
    },
  });
}

enum Command {
  OpenExpoConfigPrebuild = 'expo.config.open.prebuild',
  OpenExpoConfigManifest = 'expo.config.open.manifest',
  OpenExpoConfigResolved = 'expo.config.open.resolved',
}

let extensionContext: vscode.ExtensionContext | null = null;

export function setupPreview(context: vscode.ExtensionContext) {
  extensionContext = context;
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(Command.OpenExpoConfigPrebuild, (editor) => {
      openForEditor('prebuild', editor.document);
    }),
    vscode.commands.registerTextEditorCommand(Command.OpenExpoConfigManifest, (editor) => {
      openForEditor('manifest', editor.document);
    }),
    vscode.commands.registerTextEditorCommand(Command.OpenExpoConfigResolved, (editor) => {
      openForEditor('resolved', editor.document);
    })
  );
}

async function openForEditor(
  type: 'prebuild' | 'manifest' | 'resolved',
  document: vscode.TextDocument
): Promise<void> {
  const projectRoot = getProjectRoot(document);

  if (!isAppJson(document)) {
    window.showErrorMessage(
      `File "${path.relative(projectRoot, document.fileName)}" is not a valid Expo config`
    );
    return;
  }

  let codeProvider = codeProviders.get(type);
  if (codeProvider === undefined) {
    codeProvider = new CodeProvider(type, document);
    codeProviders.set(type, codeProvider);
    if (extensionContext != null) {
      extensionContext.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(codeProvider.scheme, codeProvider)
      );
    }
  } else {
    // codeProvider.setInputKind(inputKind);
    codeProvider.setDocument(document);
  }

  let originalEditor: vscode.TextEditor | undefined;
  if (lastCodeProvider !== undefined) {
    const doc = lastCodeProvider.document;
    originalEditor = vscode.window.visibleTextEditors.find((e) => e.document === doc);
  }
  if (originalEditor === undefined) {
    originalEditor = vscode.window.activeTextEditor;
  }

  let column: number;
  if (originalEditor !== undefined && originalEditor.viewColumn !== undefined) {
    column = originalEditor.viewColumn + 1;
  } else {
    column = 0;
  }

  lastCodeProvider = codeProvider;

  codeProvider.update();
  const doc = await vscode.workspace.openTextDocument(codeProvider.uri);
  vscode.window.showTextDocument(doc, column, true);
}
let lastCodeProvider: CodeProvider | undefined = undefined;
const codeProviders: Map<string, CodeProvider> = new Map();

class CodeProvider implements vscode.TextDocumentContentProvider {
  readonly scheme: string = 'expo-config';
  readonly uri: vscode.Uri;

  private _documentText: string = '{}';
  private _targetCode = '';

  private readonly _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  private readonly _changeSubscription: vscode.Disposable;
  private readonly _onDidChangeVisibleTextEditors: vscode.Disposable;
  private readonly _onDidChangeConfiguration: vscode.Disposable;

  private _isOpen = false;
  private _timer: NodeJS.Timer | undefined = undefined;

  constructor(
    private _type: string,

    private _document: vscode.TextDocument
  ) {
    this.scheme = `expo-config-${this._type}`;
    // TODO use this.documentName instead of QuickType in uri
    this.uri = vscode.Uri.parse(`${this.scheme}:app.json`);

    this._changeSubscription = vscode.workspace.onDidChangeTextDocument((ev) => {
      console.log('did change');
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

  // get inputKind(): InputKind {
  //     return this._inputKind;
  // }

  // setInputKind(inputKind: InputKind): void {
  //     this._inputKind = inputKind;
  // }

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
          config;
        } else {
          config = getConfig(projectRoot, {
            skipSDKVersionRequirement: true,
          }).exp;
        }
        this._targetCode = JSON.stringify(config, null, 2);
      } catch (error) {
        this._targetCode = '';
      }
      if (!this._isOpen) return;
      this._onDidChange.fire(this.uri);
    } catch (e) {}
  }

  provideTextDocumentContent(
    _uri: vscode.Uri,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<string> {
    this._isOpen = true;

    return this._targetCode;
  }
}

const configurationSection = 'expo';

export function setupPluginsValidation(context: vscode.ExtensionContext) {
  diagnosticCollection = languages.createDiagnosticCollection('expo-config');

  workspace.onDidSaveTextDocument(
    (document) => {
      validateDocument(document);
    },
    null,
    context.subscriptions
  );

  window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor && editor.document) {
        validateDocument(editor.document);
      }
    },
    null,
    context.subscriptions
  );

  validateAllDocuments();
}

function validateAllDocuments() {
  window.visibleTextEditors.forEach((each) => {
    if (each.document) {
      validateDocument(each.document);
    }
  });
}

function clearDiagnosticCollection() {
  if (diagnosticCollection) {
    diagnosticCollection.clear();
  }
}

async function validateDocument(document: TextDocument) {
  if (!isConfigPluginValidationEnabled(document)) {
    clearDiagnosticCollection();
    return;
  }
  if (!isAppJson(document)) {
    return;
  }

  // Debounce the request
  if (!delayer) {
    delayer = new ThrottledDelayer<void>(200);
  }
  delayer.trigger(() => doValidate(document));
}

function getPluginRanges(document: TextDocument) {
  try {
    clearDiagnosticCollection();
    if (!document.getText()) {
      return null;
    }
    return parseSourceRanges(document.getText());
  } catch (e) {
    const fileName = path.basename(document.fileName);
    window.showInformationMessage(`[expo-config] Cannot fetch ${fileName} plugins: ` + e);
    console.log(`expo-config: 'Error while collecting ${fileName} plugins: ${e.stack}`);
  }
}

async function doValidate(document: TextDocument) {
  const sourceRanges = getPluginRanges(document);
  if (!sourceRanges?.length) {
    return;
  }

  const projectRoot = getProjectRoot(document);

  clearDiagnosticCollection();

  const diagnostics: Diagnostic[] = [];
  for (const plugin of sourceRanges) {
    const diagnostic = getDiagnostic(projectRoot, document, plugin);
    if (diagnostic) {
      diagnostic.source = 'expo-config';
      diagnostics.push(diagnostic);
    }
  }

  diagnosticCollection!.set(document.uri, diagnostics);
}

function rangeForOffset(document: TextDocument, source: JsonRange) {
  return new Range(
    document.positionAt(source.offset),
    document.positionAt(source.offset + source.length)
  );
}

function getDiagnostic(
  projectRoot: string,
  document: TextDocument,
  plugin: PluginRange
): Diagnostic | null {
  try {
    resolveConfigPluginFunction(projectRoot, plugin.nameValue);
  } catch (error) {
    // If the plugin failed to load, surface the error info.
    const source = plugin.name;
    const range = rangeForOffset(document, source);
    const diagnostic = new Diagnostic(range, error.message, DiagnosticSeverity.Warning);
    diagnostic.code = error.code;
    return diagnostic;
  }

  // TODO: Doesn't currently support empty array.
  // NOTE(EvanBacon): The JSON schema validates 3 or more items.
  if (plugin.full && plugin.arrayLength != null && plugin.arrayLength < 2) {
    // A plugin array should only be used to add props (i.e. two items).
    const range = rangeForOffset(document, plugin.full);
    // TODO: Link to a doc or FYI
    const diagnostic = new Diagnostic(
      range,
      `Array has too few items. Expected exactly 2 items.`,
      DiagnosticSeverity.Warning
    );
    return diagnostic;
  }

  return null;
}
