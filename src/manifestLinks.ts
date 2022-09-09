import path from 'path';
import { CancellationToken, DocumentLink, TextDocument, Uri } from 'vscode';

import { createDebug } from './utils/debug';
import { findManifestFileReferences, findManifestPlugins } from './utils/expo/manifest';
import { getPluginName, resolvePluginFile } from './utils/expo/plugin';
import { manifestPattern, projectCache } from './utils/expo/project';
import { getDocumentRange } from './utils/json';

const log = createDebug('manifest-links');

export const manifestLinkProvider = {
  pattern: manifestPattern,
  provideDocumentLinks: provideManifestLinks,
};

async function provideManifestLinks(
  document: TextDocument,
  token: CancellationToken
): Promise<DocumentLink[]> {
  const links: DocumentLink[] = [];
  const project = projectCache.fromManifest(document);

  if (!project?.manifest) {
    log('Could not resolve project manifest for %s', document.fileName);
    return links;
  }

  const plugins = findManifestPlugins(project.manifest);
  const pluginsRange = plugins && getDocumentRange(document, plugins);

  for (const plugin of plugins?.children ?? []) {
    if (token.isCancellationRequested) break;

    const { name, range } = getPluginName(plugin);
    const file = resolvePluginFile(project.root, name);

    if (file) {
      const link = new DocumentLink(getDocumentRange(document, range), Uri.file(file));
      link.tooltip = 'Go to plugin';
      links.push(link);
    }
  }

  for (const reference of findManifestFileReferences(project.manifest)) {
    if (token.isCancellationRequested) break;

    const range = getDocumentRange(document, reference.range);

    if (!pluginsRange?.contains(range)) {
      const file = path.resolve(project.root, reference.file);
      const link = new DocumentLink(range, Uri.file(file));
      link.tooltip = 'Go to asset';
      links.push(link);
    }
  }

  return links;
}
