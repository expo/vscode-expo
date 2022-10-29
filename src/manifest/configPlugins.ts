import { resolveConfigPluginFunction } from '@expo/config-plugins/build/utils/plugin-resolver';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {
  Diagnostic,
  DiagnosticCollection,
  DiagnosticSeverity,
  languages,
  TextDocument,
  window,
  workspace,
} from 'vscode';

import { isManifestPluginValidationEnabled } from '../settings';
import { getProjectRoot } from '../utils/getProjectRoot';
import { iterateFileReferences } from './fileReferences';
import { ThrottledDelayer } from './utils/async';
import { parseSourceRanges, PluginRange, rangeForQuotedOffset } from './utils/iteratePlugins';
import { isAppJson } from './utils/parseExpoJson';

let diagnosticCollection: DiagnosticCollection | null = null;
let delayer: ThrottledDelayer<void> | null = null;

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

  // TODO: Update on text change

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
  if (!isManifestPluginValidationEnabled(document)) {
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
  const info = getPluginRanges(document);

  if (!info?.appJson) {
    return;
  }

  const projectRoot = getProjectRoot(document);

  clearDiagnosticCollection();
  const diagnostics: Diagnostic[] = [];

  if (info.plugins?.length) {
    for (const plugin of info.plugins) {
      const diagnostic = getDiagnostic(projectRoot, document, plugin);
      if (diagnostic) {
        diagnostic.source = 'expo-config';
        diagnostics.push(diagnostic);
      }
    }
  }

  // Add errors for missing file references starting with `"./` that are not inside in the plugins array.
  iterateFileReferences(document, info.appJson, ({ range, fileReference }) => {
    const filePath = path.join(projectRoot, fileReference);

    try {
      fs.statSync(filePath);
    } catch (error) {
      const diagnostic = new Diagnostic(range, error.message, DiagnosticSeverity.Error);
      diagnostic.code = error.code;
      diagnostics.push(diagnostic);
    }
  });

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
    const range = rangeForQuotedOffset(document, source);
    const diagnostic = new Diagnostic(range, error.message, DiagnosticSeverity.Error);
    diagnostic.code = error.code;
    return diagnostic;
  }

  // TODO: Doesn't currently support empty array.
  // NOTE(EvanBacon): The JSON schema validates 3 or more items.
  if (plugin.full && plugin.arrayLength != null && plugin.arrayLength < 2) {
    // A plugin array should only be used to add props (i.e. two items).
    const range = rangeForQuotedOffset(document, plugin.full);
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
