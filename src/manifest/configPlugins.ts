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
import { JavaScriptProvider } from './providers/pluginProvider';

import { isConfigPluginValidationEnabled } from './settings';
import { ThrottledDelayer } from './utils/async';
import { getProjectRoot } from './utils/getProjectRoot';
import {
  iteratePluginNames,
  JsonRange,
  parseSourceRanges,
  PluginRange,
  rangeForOffset,
} from './utils/iteratePlugins';
import { appJsonPattern, isAppJson, parseExpoJson } from './utils/parseExpoJson';

let diagnosticCollection: DiagnosticCollection | null = null;
let delayer: ThrottledDelayer<void> | null = null;

export function setupCompletionItemProvider(context: vscode.ExtensionContext) {
  const disposable = languages.registerCompletionItemProvider(
    JavaScriptProvider.selector,
    JavaScriptProvider.provider,
    ...(JavaScriptProvider.triggerCharacters || [])
  );
  context.subscriptions.push(disposable);
}

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
    const diagnostic = new Diagnostic(range, error.message, DiagnosticSeverity.Error);
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
