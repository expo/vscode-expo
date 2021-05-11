import { sep } from 'path';
import * as vscode from 'vscode';
import { positionIsInPlugins } from '../utils/iteratePlugins';

type ResolveType = 'plugin';

export interface Context {
  textFullLine: string;
  fromString?: string;
  document: vscode.TextDocument;
  importRange: vscode.Range;
  documentExtension: string | undefined;
  resolveType?: ResolveType;
}

export function createContext(document: vscode.TextDocument, position: vscode.Position): Context {
  const textFullLine = document.getText(document.lineAt(position).range);
  const fromString = getFromString(textFullLine, position.character);
  const importRange = importStringRange(textFullLine, position);
  const documentExtension = extractExtension(document);

  let resolveType: ResolveType | undefined;
  if (positionIsInPlugins(document, position)) {
    resolveType = 'plugin';
  }

  return {
    resolveType,
    textFullLine,
    fromString,
    document,
    importRange,
    documentExtension,
  };
}

function getFromString(textFullLine: string, position: number) {
  const textToPosition = textFullLine.substring(0, position);
  const quoatationPosition = Math.max(
    textToPosition.lastIndexOf('"')
    // textToPosition.lastIndexOf("'"),
    // textToPosition.lastIndexOf('`')
  );
  return quoatationPosition !== -1
    ? textToPosition.substring(quoatationPosition + 1, textToPosition.length)
    : undefined;
}

function importStringRange(line: string, position: vscode.Position): vscode.Range {
  const textToPosition = line.substring(0, position.character);
  const slashPosition = textToPosition.lastIndexOf(sep);

  const startPosition = new vscode.Position(position.line, slashPosition + 1);
  const endPosition = position;

  return new vscode.Range(startPosition, endPosition);
}

export function extractExtension(document: vscode.TextDocument) {
  if (document.isUntitled) {
    return undefined;
  }

  const fragments = document.fileName.split('.');
  const extension = fragments[fragments.length - 1];

  if (!extension || extension.length > 3) {
    return undefined;
  }

  return extension;
}
