import {
  resolveConfigPluginFunction,
  resolveConfigPluginFunctionWithInfo,
} from '@expo/config-plugins/build/utils/plugin-resolver';
import assert from 'assert';
import findUp from 'find-up';
import { Node, ParseError, parseTree } from 'jsonc-parser';
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

import { ThrottledDelayer } from './async';

let diagnosticCollection: DiagnosticCollection | null = null;
let delayer: ThrottledDelayer<void> | null = null;
let expoJsonCache: Record<string, Node> = {};

const appJsonPattern = {
  scheme: 'file',
  // Match against app.json and app.config.json
  pattern: '**/*/app{,.config}.json',
  language: 'json',
};

function isAppJson(document: TextDocument) {
  return document && ['app.json', 'app.config.json'].includes(path.basename(document.fileName));
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

// Enable toggling in settings via expo.config.validate.enable
function isValidationEnabled(document: TextDocument) {
  const section = workspace.getConfiguration('expo', document.uri);
  if (section) {
    return section.get<boolean>('config.validate.enable', true);
  }
  return false;
}

export function setupPluginsValidation(context: vscode.ExtensionContext) {
  diagnosticCollection = languages.createDiagnosticCollection('expo-config');

  workspace.onDidSaveTextDocument(
    (document) => {
      if (isValidationEnabled(document)) {
        validateDocument(document);
      }
    },
    null,
    context.subscriptions
  );

  window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor && editor.document && isValidationEnabled(editor.document)) {
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

function findUpPackageJson(root: string): string {
  const packageJson = findUp.sync('package.json', { cwd: root });
  assert(packageJson, `No package.json found for module "${root}"`);
  return packageJson;
}

async function validateDocument(document: TextDocument) {
  if (!isValidationEnabled(document)) {
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

function getProjectRoot(appJsonDocument: TextDocument): string {
  return path.dirname(findUpPackageJson(appJsonDocument.fileName));
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
  if (!sourceRanges?.plugins?.length) {
    return;
  }

  const projectRoot = getProjectRoot(document);

  clearDiagnosticCollection();

  const diagnostics: Diagnostic[] = [];
  for (const plugin of sourceRanges.plugins) {
    const diagnostic = getDiagnostic(projectRoot, document, plugin);
    if (diagnostic) {
      diagnostic.source = 'expo-config';
      diagnostics.push(diagnostic);
    }
  }

  diagnosticCollection!.set(document.uri, diagnostics);
}

function parseExpoJson(text: string): { node: Node | undefined; errors: ParseError[] } {
  if (text in expoJsonCache) {
    return { node: expoJsonCache[text], errors: [] };
  }
  const errors: ParseError[] = [];
  function findUpExpoObject(node: Node | undefined): Node | undefined {
    if (node?.children) {
      for (const child of node.children) {
        if (
          child.type === 'property' &&
          child.children?.[0]?.value === 'expo' &&
          child.children?.[1]?.type === 'object'
        ) {
          return findUpExpoObject(child.children[1]);
        }
      }
    }
    return node;
  }
  // Ensure we get the expo object if it exists.
  const node = findUpExpoObject(parseTree(text, errors));
  if (node) {
    expoJsonCache = {
      [text]: node,
    };
  }
  return { node, errors };
}

function iteratePlugins(appJson: Node | undefined, iterator: (node: Node) => void) {
  let pluginsNode: Node | undefined;
  if (appJson?.children) {
    for (const child of appJson.children) {
      const children = child.children;
      if (children) {
        if (children && children.length === 2 && isPlugins(children[0].value)) {
          pluginsNode = children[1];
          break;
        }
      }
    }
  }

  if (pluginsNode?.children) {
    pluginsNode.children.forEach(iterator);
  }
}

function iteratePluginNames(
  appJson: Node | undefined,
  iterator: (resolver: PluginRangeWithProps, node: Node) => void
) {
  iteratePlugins(appJson, (node) => {
    let resolver = getPluginResolver(node);
    if (resolver) {
      iterator(resolver, node);
    } else if (node.type === 'array' && node.children?.length) {
      resolver = getPluginResolver(node.children[0]);
      if (!resolver) return;

      const props = node.children[1];

      // Tested against objects as props
      if (props) {
        resolver.props = {
          offset: props.offset,
          length: props.length,
        };
      }

      iterator(resolver, node);
    }
  });
}

function getPluginResolver(child?: Node): PluginRangeWithProps | null {
  if (child?.type === 'string') {
    return {
      nameValue: child.value,
      name: {
        offset: child.offset,
        length: child.length,
      },
    };
  }
  return null;
}

function parseSourceRanges(text: string): { plugins: PluginRangeWithProps[] } {
  const definedPlugins: PluginRangeWithProps[] = [];
  // Ensure we get the expo object if it exists.
  const { node } = parseExpoJson(text);

  iteratePluginNames(node, (resolver, node) => {
    definedPlugins.push(resolver);
  });

  return { plugins: definedPlugins };
}

function isPlugins(value: string) {
  return value === 'plugins';
}

function rangeForOffset(document: TextDocument, source: JsonRange) {
  return new Range(
    document.positionAt(source.offset),
    document.positionAt(source.offset + source.length)
  );
}

interface JsonRange {
  offset: number;
  length: number;
}

interface PluginRange {
  nameValue: string;
  name: JsonRange;
}

interface PluginRangeWithProps extends PluginRange {
  props?: JsonRange;
}

function getDiagnostic(
  projectRoot: string,
  document: TextDocument,
  plugin: PluginRangeWithProps
): Diagnostic | null {
  try {
    resolveConfigPluginFunction(projectRoot, plugin.nameValue);
    return null;
  } catch (error) {
    // If the plugin failed to load, surface the error info.
    const source = plugin.name;
    const range = rangeForOffset(document, source);
    const diagnostic = new Diagnostic(range, error.message, DiagnosticSeverity.Error);
    diagnostic.code = error.code;
    return diagnostic;
  }
}
