import * as path from 'path';
import * as vscode from 'vscode';

import { findUpPackageJson } from '../../manifest/utils/getProjectRoot';
import { positionIsInPlugins } from '../../manifest/utils/iteratePlugins';

type ResolveType = 'plugin' | 'image';

export interface Context {
  textFullLine: string;
  fromString?: string;
  document: vscode.TextDocument;
  importRange: vscode.Range;
  moduleImportRange: vscode.Range;
  documentExtension: string | undefined;
  resolveType?: ResolveType;
  packageJsonPath?: string;
}

export function createContext(document: vscode.TextDocument, position: vscode.Position): Context {
  const textFullLine = document.getText(document.lineAt(position).range);
  const fromString = getFromString(textFullLine, position.character);
  const importRange = importStringRange(textFullLine, position, path.sep);
  const moduleImportRange = importStringRange(textFullLine, position, `"`);
  const documentExtension = extractExtension(document);

  let packageJsonPath: string | undefined;
  try {
    packageJsonPath = findUpPackageJson(document.fileName);
  } catch {}

  let resolveType: ResolveType | undefined;

  if (textFullLine.trim().match(/^"(image|icon)":/)) {
    resolveType = 'image';
  } else if (positionIsInPlugins(document, position)) {
    resolveType = 'plugin';
  }

  return {
    packageJsonPath,
    resolveType,
    textFullLine,
    fromString,
    document,
    importRange,
    moduleImportRange,
    documentExtension,
  };
}

function getFromString(textFullLine: string, position: number) {
  const textToPosition = textFullLine.substring(0, position);
  const quoteIndex = textToPosition.lastIndexOf('"');
  return quoteIndex !== -1
    ? textToPosition.substring(quoteIndex + 1, textToPosition.length)
    : undefined;
}

function importStringRange(
  line: string,
  position: vscode.Position,
  targetCharacter: string
): vscode.Range {
  const textToPosition = line.substring(0, position.character);
  const slashPosition = textToPosition.lastIndexOf(targetCharacter);

  const startPosition = new vscode.Position(position.line, slashPosition + 1);
  const endPosition = position;

  return new vscode.Range(startPosition, endPosition);
}

export function extractExtension(document: vscode.TextDocument) {
  if (document.isUntitled) {
    return undefined;
  }

  const fragments = path.extname(document.fileName).slice(1);
  const extension = fragments[fragments.length - 1];

  if (!extension || extension.length > 3) {
    return undefined;
  }

  return extension;
}
