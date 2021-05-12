import { getConfig, getPrebuildConfig } from '@expo/config';
import {
  resolveConfigPluginFunction,
  resolveConfigPluginFunctionWithInfo,
} from '@expo/config-plugins/build/utils/plugin-resolver';
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
import { compileManifestMockAsync } from './mockModCompiler';
import {
  AndroidManifestCodeProvider,
  CodeProvider,
  EntitlementsPlistCodeProvider,
  InfoPlistCodeProvider,
  PrebuildConfigCodeProvider,
} from './PrebuildCodeProvider';

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
  OpenExpoFilePrebuild = 'expo.config.open.prebuild.file',
  OpenExpoFileJsonPrebuild = 'expo.config.open.prebuild.file.json',
  OpenExpoConfigPrebuild = 'expo.config.open.prebuild.config',
}

let extensionContext: vscode.ExtensionContext | null = null;

export function setupPreview(context: vscode.ExtensionContext) {
  extensionContext = context;
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(Command.OpenExpoConfigPrebuild, async (editor) => {
      openForEditor('config.prebuild', editor.document);
    }),
    vscode.commands.registerTextEditorCommand(Command.OpenExpoFilePrebuild, async (editor) => {
      const option = await vscode.window.showQuickPick([
        'android.manifest',
        'ios.entitlements',
        'ios.infoPlist',
      ]);
      if (option) {
        openForEditor(option, editor.document);
      }
    }),
    vscode.commands.registerTextEditorCommand(Command.OpenExpoFileJsonPrebuild, async (editor) => {
      const option = await vscode.window.showQuickPick([
        'android.manifest',
        'ios.entitlements',
        'ios.infoPlist',
      ]);
      if (option) {
        openForEditor(option, editor.document, true);
      }
    })
  );
}

const CodeProviders: Record<string, any> = {
  'android.manifest': AndroidManifestCodeProvider,
  'ios.entitlements': EntitlementsPlistCodeProvider,
  'ios.infoPlist': InfoPlistCodeProvider,
  'config.prebuild': PrebuildConfigCodeProvider,
};

async function openForEditor(
  type: string,
  document: vscode.TextDocument,
  isJSON?: boolean
): Promise<void> {
  if (!(type in CodeProviders)) {
    throw new Error('invalid type: ' + type);
  }
  let codeProvider = codeProviders.get(type);
  if (codeProvider === undefined) {
    const Provider = CodeProviders[type];

    codeProvider = new Provider(document, { convertLanguage: isJSON ? 'json' : undefined })!;

    // codeProvider = new CodeProvider(type, document);
    // codeProvider = new InfoPlistCodeProvider(document);
    // codeProvider = new AndroidManifestCodeProvider(document);
    codeProviders.set(type, codeProvider);
    if (extensionContext != null) {
      extensionContext.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(codeProvider.scheme, codeProvider)
      );
    }
  } else {
    codeProvider.options.convertLanguage = isJSON ? 'json' : undefined;
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

  await codeProvider.update();
  const doc = await vscode.workspace.openTextDocument(codeProvider.getURI());
  vscode.window.showTextDocument(doc, column, true);
}
let lastCodeProvider: CodeProvider | undefined = undefined;
const codeProviders: Map<string, CodeProvider> = new Map();

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
