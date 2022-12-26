import { Range } from 'jsonc-parser';
import { DocumentFilter } from 'vscode';

export type FileReference = {
  filePath: string;
  fileRange: Range;
};

/**
 * Select documents matching `app.json` or `app.config.json`.
 * Note, language is set to JSONC instead of JSON(5) to enable comments.
 */
export const manifestPattern: DocumentFilter = {
  scheme: 'file',
  language: 'jsonc',
  pattern: '**/*/app{,.config}.json',
};

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
