import * as path from 'path';
import * as vscode from 'vscode';

import { findUpPackageJson } from '../../manifest/utils/getProjectRoot';
import { positionIsInPlugins } from '../../manifest/utils/iteratePlugins';

export type ResolveType = 'plugin' | 'image';

export interface Context {
  textFullLine: string;
  fromString?: string;
  document: vscode.TextDocument;
  importRange: vscode.Range;
  isModule?: boolean;
  moduleImportRange: vscode.Range;
  resolveType?: ResolveType;
  packageJsonPath?: string;
}

export function matchesImageProperty(line: string): boolean {
  return /^"((?:x?x?x?(?:h|m)dpi)|(tablet|foreground|background)?[iI]mage|(?:fav)?icon)":/.test(
    line
  );
}

export function createContext(
  document: vscode.TextDocument,
  position: vscode.Position
): Context | null {
  const textFullLine = document.getText(document.lineAt(position).range);
  let resolveType: ResolveType | undefined;

  if (
    textFullLine
      .trim()
      .match(/^"((?:x?x?x?(?:h|m)dpi)|(tablet|foreground|background)?[iI]mage|(?:fav)?icon)":/)
  ) {
    resolveType = 'image';
    // return null;
  } else if (positionIsInPlugins(document, position)) {
    // Only support plugins for now
    resolveType = 'plugin';
  } else {
    // As an optimization, bail out if we cannot determine the completion type.
    return null;
  }

  const fromString = getFromString(textFullLine, position.character);
  const importRange = getImportStringRange(textFullLine, position, path.sep);
  const moduleImportRange = getImportStringRange(textFullLine, position, `"`);

  let packageJsonPath: string | undefined;
  try {
    packageJsonPath = findUpPackageJson(document.fileName);
  } catch {}

  // If the suggestion is for a blank line (triggered by a quote) then suggest a node module.
  const isModule =
    (!fromString || !fromString.length || !fromString.match(/^(\/|\.)/)) && !!packageJsonPath;

  return {
    packageJsonPath,
    resolveType,
    isModule,
    textFullLine,
    fromString,
    document,
    importRange,
    moduleImportRange,
  };
}

function getFromString(textFullLine: string, position: number) {
  const textToPosition = textFullLine.substring(0, position);
  const quoteIndex = textToPosition.lastIndexOf('"');
  return quoteIndex !== -1
    ? textToPosition.substring(quoteIndex + 1, textToPosition.length)
    : undefined;
}

function getImportStringRange(
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
