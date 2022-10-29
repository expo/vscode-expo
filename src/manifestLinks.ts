import { findNodeAtLocation } from 'jsonc-parser';
import path from 'path';
import { CancellationToken, DocumentLink, ExtensionContext, TextDocument, Uri } from 'vscode';

import {
  getFileReferences,
  getPluginDefinition,
  manifestPattern,
  resolvePlugin,
} from './expo/manifest';
import { ExpoProjectCache } from './expo/project';
import { isManifestFileReferencesEnabled } from './settings';
import { debug } from './utils/debug';
import { getDocumentRange } from './utils/json';
import { ExpoLinkProvider } from './utils/vscode';

const log = debug.extend('manifest-links');

export class ManifestLinksProvider extends ExpoLinkProvider {
  private isEnabled = true;

  constructor(extension: ExtensionContext, projects: ExpoProjectCache) {
    super(extension, projects, manifestPattern);
    this.isEnabled = isManifestFileReferencesEnabled(); // TODO: Add change listener
  }

  provideDocumentLinks(document: TextDocument, token: CancellationToken) {
    const links: DocumentLink[] = [];

    if (!this.isEnabled) return links;

    const project = this.projects.fromManifest(document);
    if (!project?.manifest) {
      log('Could not resolve project from manifest "%s"', document.fileName);
      return links;
    }

    const plugins = findNodeAtLocation(project.manifest.tree, ['plugins']);
    const pluginsRange = plugins && getDocumentRange(document, plugins);

    for (const pluginNode of plugins?.children ?? []) {
      if (token.isCancellationRequested) return links;

      const { nameValue, nameRange } = getPluginDefinition(pluginNode);
      const plugin = resolvePlugin(project.root, nameValue);

      if (plugin) {
        const link = new DocumentLink(
          getDocumentRange(document, nameRange),
          Uri.file(plugin.pluginFile)
        );

        link.tooltip = 'Go to plugin';
        links.push(link);
      }
    }

    for (const reference of getFileReferences(project.manifest.content)) {
      if (token.isCancellationRequested) return links;

      const range = getDocumentRange(document, reference.fileRange);

      if (!pluginsRange?.contains(range)) {
        const file = path.resolve(project.root, reference.filePath);
        const link = new DocumentLink(range, Uri.file(file));

        link.tooltip = 'Go to asset';
        links.push(link);
      }
    }

    return links;
  }
}
