import { Range } from 'jsonc-parser';
import { DocumentFilter, DocumentSelector, TextDocument, languages } from 'vscode';

export type FileReference = {
  filePath: string;
  fileRange: Range;
};

/**
 * Select documents matching `app.json` or `app.config.json`.
 * Note, language is set to JSONC instead of JSON(5) to enable comments.
 */
export const jsonManifestPattern: DocumentFilter = {
  scheme: 'file',
  language: 'jsonc',
  pattern: '**/*/app{,.config}.json',
};

export const dynamicManifestPattern: DocumentSelector = [
  {
    scheme: 'file',
    language: 'javascript',
    pattern: '**/*/app.config.js',
  },
  {
    scheme: 'file',
    language: 'typescript',
    pattern: '**/*/app.config.ts',
  },
];

export const manifestPattern: DocumentSelector = [jsonManifestPattern, ...dynamicManifestPattern];

export function isJsonManifestDocument(document: TextDocument) {
  return languages.match(jsonManifestPattern, document) > 0;
}

export function isDynamicManifestDocument(document: TextDocument) {
  return languages.match(dynamicManifestPattern, document) > 0;
}

/**
 * Find all (sub)strings that might be a file path.
 * This returns all strings matching `"./"` or "../".
 */
export function getFileReferences(manifest: string): FileReference[] {
  const references = [];
  const matches = manifest.matchAll(/"(\.\.?\/.*)"/g);

  for (const match of matches) {
    if (!match.index) continue;

    references.push({
      filePath: match[1],
      fileRange: {
        // Match index starts at the first quote,
        // offset it by 1 character to exclude from range.
        offset: match.index + 1,
        length: match[1].length,
      },
    });
  }

  return references;
}
