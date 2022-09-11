import path from 'path';
import vscode from 'vscode';

import { findManifestFileReferences, findManifestPlugins, manifestPattern } from './expo/manifest';
import { getPluginDefinition, resolvePluginFile } from './expo/plugin';
import { ExpoProjectCache } from './expo/project';
import { createDebug } from './utils/debug';
import { getDocumentRange } from './utils/json';
import { ExpoLinkProvider } from './utils/vscode';

const log = createDebug('manifest-links');

export class ManifestLinkProvider extends ExpoLinkProvider {
  constructor(context: vscode.ExtensionContext, projects: ExpoProjectCache) {
    super(context, projects, manifestPattern);
  }

  provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken) {
    const links: vscode.DocumentLink[] = [];
    const project = this.projects.fromManifest(document);

    if (!project?.manifest) {
      log('Could not resolve project manifest for %s', document.fileName);
      return links;
    }

    const plugins = findManifestPlugins(project.manifest);
    const pluginsRange = plugins && getDocumentRange(document, plugins);

    for (const plugin of plugins?.children ?? []) {
      if (token.isCancellationRequested) break;

      const { nameValue: name, nameRange: range } = getPluginDefinition(plugin);
      const file = resolvePluginFile(project.root, name);

      if (file) {
        const link = new vscode.DocumentLink(
          getDocumentRange(document, range),
          vscode.Uri.file(file)
        );

        link.tooltip = 'Go to plugin';
        links.push(link);
      }
    }

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
