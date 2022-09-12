import path from 'path';
import vscode from 'vscode';

import { findManifestFileReferences, findManifestPlugins, manifestPattern } from './expo/manifest';
import { getDefinedPlugins, resolvePluginInfo } from './expo/plugin';
import { ExpoProjectCache } from './expo/project';
import { createDebug } from './utils/debug';
import { getDocumentRange } from './utils/json';
import { ExpoLinkProvider } from './vscode/link';

const log = createDebug('manifest-links');

export class ManifestLinkProvider extends ExpoLinkProvider {
  constructor(context: vscode.ExtensionContext, projects: ExpoProjectCache) {
    super(context, projects, manifestPattern);
  }

  provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken) {
    const project = this.projects.fromManifest(document);
    if (!project || !project.manifest) {
      log('Could not resolve project manifest for %s', document.fileName);
      return null;
    }

    const links: vscode.DocumentLink[] = [];
    const pluginsNode = findManifestPlugins(project.manifest);
    const pluginsRange = pluginsNode && getDocumentRange(document, pluginsNode);

    getDefinedPlugins(pluginsNode).forEach((plugin) => {
      if (token.isCancellationRequested) return;

      const file = resolvePluginInfo(project.root, plugin.nameValue)?.pluginFile;
      if (file) {
        const link = new vscode.DocumentLink(
          getDocumentRange(document, plugin.nameRange),
          vscode.Uri.file(file)
        );

        link.tooltip = 'Go to plugin';
        links.push(link);
      }
    });

    for (const reference of findManifestFileReferences(project.manifest)) {
      if (token.isCancellationRequested) break;

      const range = getDocumentRange(document, reference.fileRange);

      if (!pluginsRange?.contains(range)) {
        const file = path.resolve(project.root, reference.filePath);
        const link = new vscode.DocumentLink(range, vscode.Uri.file(file));

        link.tooltip = 'Go to asset';
        links.push(link);
      }
    }

    return links;
  }
}
