import { Range } from 'jsonc-parser';
import path from 'path';
import ts from 'typescript';
import vscode from 'vscode';

import { getDirectoryPath } from '../utils/file';

export type FileReference = {
  filePath: string;
  fileRange: Range;
};

export type PluginDefinition = {
  nameValue?: string;
  nameRange: Range;
};

export type StringReferenceContext =
  | {
      kind: 'asset';
      keyName: string;
      value: string;
    }
  | {
      kind: 'plugin';
      value: string;
    };

const ASSET_PROPERTIES =
  /^((?:x?x?x?(?:h|m)dpi)|(tablet|foreground|background)?[iI]mage|(?:fav)?icon)/;

export function getDynamicAssetReferences(document: vscode.TextDocument): FileReference[] {
  const config = getExpoConfigObject(document);
  if (!config) {
    return [];
  }

  const references: FileReference[] = [];
  collectAssetReferences(config, references);
  return references;
}

export function getDynamicPluginDefinitions(document: vscode.TextDocument): PluginDefinition[] {
  const config = getExpoConfigObject(document);
  if (!config) {
    return [];
  }

  const plugins = findPropertyAssignment(config, 'plugins');
  if (!plugins || !ts.isArrayLiteralExpression(plugins.initializer)) {
    return [];
  }

  return plugins.initializer.elements.map((element) => getPluginDefinition(element));
}

export function getDynamicStringReferenceContext(
  document: vscode.TextDocument,
  position: vscode.Position
): StringReferenceContext | undefined {
  const sourceFile = createSourceFile(document);
  const offset = document.offsetAt(position);
  const node = findStringNodeAtOffset(sourceFile, offset);
  if (!node) {
    return undefined;
  }

  const pluginContext = getPluginContext(node);
  if (pluginContext) {
    return pluginContext;
  }

  const assetContext = getAssetContext(node);
  if (assetContext) {
    return assetContext;
  }

  return undefined;
}

function getExpoConfigObject(
  document: vscode.TextDocument
): ts.ObjectLiteralExpression | undefined {
  const sourceFile = createSourceFile(document);
  const bindings = collectTopLevelBindings(sourceFile);

  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement)) {
      const config = extractConfigObjectFromExpression(statement.expression, bindings);
      if (config) {
        return normalizeExpoConfigObject(config);
      }
    }

    if (ts.isFunctionDeclaration(statement) && hasDefaultExportModifier(statement)) {
      const config = extractConfigObjectFromFunction(statement, bindings);
      if (config) {
        return normalizeExpoConfigObject(config);
      }
    }

    if (
      ts.isExpressionStatement(statement) &&
      ts.isBinaryExpression(statement.expression) &&
      statement.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      isModuleExportsExpression(statement.expression.left)
    ) {
      const config = extractConfigObjectFromExpression(statement.expression.right, bindings);
      if (config) {
        return normalizeExpoConfigObject(config);
      }
    }
  }

  return undefined;
}

function createSourceFile(document: vscode.TextDocument) {
  return ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    true,
    document.fileName.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS
  );
}

function collectTopLevelBindings(sourceFile: ts.SourceFile) {
  const bindings = new Map<string, ts.Expression | ts.FunctionDeclaration>();

  for (const statement of sourceFile.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.initializer &&
          (ts.isExpression(declaration.initializer) ||
            ts.isArrowFunction(declaration.initializer) ||
            ts.isFunctionExpression(declaration.initializer))
        ) {
          bindings.set(declaration.name.text, declaration.initializer);
        }
      }
    }

    if (ts.isFunctionDeclaration(statement) && statement.name) {
      bindings.set(statement.name.text, statement);
    }
  }

  return bindings;
}

function extractConfigObjectFromExpression(
  expression: ts.Expression,
  bindings: Map<string, ts.Expression | ts.FunctionDeclaration>
): ts.ObjectLiteralExpression | undefined {
  if (ts.isParenthesizedExpression(expression)) {
    return extractConfigObjectFromExpression(expression.expression, bindings);
  }

  if (ts.isObjectLiteralExpression(expression)) {
    return expression;
  }

  if (ts.isIdentifier(expression)) {
    const resolved = bindings.get(expression.text);
    if (resolved) {
      return ts.isFunctionDeclaration(resolved)
        ? extractConfigObjectFromFunction(resolved, bindings)
        : extractConfigObjectFromExpression(resolved, bindings);
    }
  }

  if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression)) {
    return extractConfigObjectFromFunction(expression, bindings);
  }

  return undefined;
}

function extractConfigObjectFromFunction(
  declaration: ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction,
  bindings: Map<string, ts.Expression | ts.FunctionDeclaration>
): ts.ObjectLiteralExpression | undefined {
  if (!declaration.body) {
    return undefined;
  }

  if (ts.isObjectLiteralExpression(declaration.body)) {
    return declaration.body;
  }

  if (!ts.isBlock(declaration.body)) {
    return undefined;
  }

  for (const statement of declaration.body.statements) {
    if (ts.isReturnStatement(statement) && statement.expression) {
      return extractConfigObjectFromExpression(statement.expression, bindings);
    }
  }

  return undefined;
}

function hasDefaultExportModifier(node: ts.HasModifiers) {
  const modifiers = node.modifiers ?? [];
  return (
    modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) &&
    modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)
  );
}

function isModuleExportsExpression(expression: ts.Expression) {
  return (
    ts.isPropertyAccessExpression(expression) &&
    ts.isIdentifier(expression.expression) &&
    expression.expression.text === 'module' &&
    expression.name.text === 'exports'
  );
}

function normalizeExpoConfigObject(config: ts.ObjectLiteralExpression) {
  const expoProperty = findPropertyAssignment(config, 'expo');
  if (expoProperty && ts.isObjectLiteralExpression(expoProperty.initializer)) {
    return expoProperty.initializer;
  }

  return config;
}

function findPropertyAssignment(object: ts.ObjectLiteralExpression, name: string) {
  return object.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) && getPropertyName(property.name) === name
  );
}

function getPropertyName(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }

  return undefined;
}

function collectAssetReferences(node: ts.Expression, references: FileReference[]) {
  if (ts.isObjectLiteralExpression(node)) {
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) {
        continue;
      }

      const keyName = getPropertyName(property.name);
      if (!keyName || keyName === 'plugins') {
        continue;
      }

      if (isStringLiteralNode(property.initializer)) {
        const value = getStringValue(property.initializer);
        if (value.startsWith('.') && ASSET_PROPERTIES.test(keyName)) {
          references.push({
            filePath: value,
            fileRange: getStringNodeRange(property.initializer),
          });
        }
      } else if (
        ts.isObjectLiteralExpression(property.initializer) ||
        ts.isArrayLiteralExpression(property.initializer)
      ) {
        collectAssetReferences(property.initializer, references);
      }
    }
  }

  if (ts.isArrayLiteralExpression(node)) {
    for (const element of node.elements) {
      if (ts.isObjectLiteralExpression(element) || ts.isArrayLiteralExpression(element)) {
        collectAssetReferences(element, references);
      }
    }
  }
}

function getPluginDefinition(element: ts.Expression): PluginDefinition {
  if (isStringLiteralNode(element)) {
    return {
      nameValue: getStringValue(element),
      nameRange: getStringNodeRange(element),
    };
  }

  if (ts.isArrayLiteralExpression(element) && element.elements.length > 0) {
    const firstElement = element.elements[0];
    if (isStringLiteralNode(firstElement)) {
      return {
        nameValue: getStringValue(firstElement),
        nameRange: getStringNodeRange(firstElement),
      };
    }
  }

  return {
    nameRange: getNodeRange(element),
  };
}

function getPluginContext(node: ts.Node): StringReferenceContext | undefined {
  const pluginElement = findAncestor(node, (ancestor) => {
    if (!ts.isArrayLiteralExpression(ancestor)) {
      return false;
    }

    const parent = ancestor.parent;
    return (
      ts.isPropertyAssignment(parent) &&
      getPropertyName(parent.name) === 'plugins' &&
      parent.initializer === ancestor
    );
  });

  if (!pluginElement || !isStringLiteralNode(node)) {
    return undefined;
  }

  const tuple = findAncestor(node, ts.isArrayLiteralExpression);
  if (tuple && tuple !== pluginElement && tuple.elements[0] !== node) {
    return undefined;
  }

  return {
    kind: 'plugin',
    value: getStringValue(node),
  };
}

function getAssetContext(node: ts.Node): StringReferenceContext | undefined {
  if (!isStringLiteralNode(node) || !node.parent || !ts.isPropertyAssignment(node.parent)) {
    return undefined;
  }

  if (node.parent.initializer !== node) {
    return undefined;
  }

  const keyName = getPropertyName(node.parent.name);
  const value = getStringValue(node);

  if (!keyName || !value.startsWith('.') || !ASSET_PROPERTIES.test(keyName)) {
    return undefined;
  }

  return {
    kind: 'asset',
    keyName,
    value,
  };
}

function findStringNodeAtOffset(sourceFile: ts.SourceFile, offset: number) {
  let bestMatch: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | undefined;

  function visit(node: ts.Node) {
    if (offset < node.getStart(sourceFile) || offset > node.getEnd()) {
      return;
    }

    if (isStringLiteralNode(node)) {
      const start = node.getStart(sourceFile) + 1;
      const end = node.getEnd() - 1;
      if (offset >= start && offset <= end) {
        bestMatch = node;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return bestMatch;
}

function findAncestor<T extends ts.Node>(
  node: ts.Node,
  predicate: (node: ts.Node) => node is T
): T | undefined;
function findAncestor(node: ts.Node, predicate: (node: ts.Node) => boolean): ts.Node | undefined;
function findAncestor(node: ts.Node, predicate: (node: ts.Node) => boolean) {
  let current = node.parent;
  while (current) {
    if (predicate(current)) {
      return current;
    }
    current = current.parent;
  }

  return undefined;
}

function isStringLiteralNode(
  node: ts.Node
): node is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}

function getStringValue(node: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral) {
  return node.text;
}

function getStringNodeRange(node: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral): Range {
  return {
    offset: node.getStart() + 1,
    length: Math.max(0, node.getEnd() - node.getStart() - 2),
  };
}

function getNodeRange(node: ts.Node): Range {
  return {
    offset: node.getStart(),
    length: node.getEnd() - node.getStart(),
  };
}

export function getDynamicReferenceDirectoryPath(reference: string) {
  return getDirectoryPath(reference) ?? '';
}

export function isDynamicPluginFile(entityName: string) {
  return path.extname(entityName) === '.js';
}
