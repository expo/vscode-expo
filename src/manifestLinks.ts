import { findNodeAtLocation } from 'jsonc-parser';
import path from 'path';
import vscode from 'vscode';

import { getFileReferences, manifestPattern } from './expo/manifest';
import { getPluginDefinition, resolvePluginInfo } from './expo/plugin';
import { ExpoProjectCache } from './expo/project';
import { isManifestFileReferencesEnabled } from './settings';
import { debug } from './utils/debug';
import { getDocumentRange } from './utils/json';
import { ExpoLinkProvider } from './utils/vscode';

const log = debug.extend('manifest-links');

export class ManifestLinksProvider extends ExpoLinkProvider {
  private isEnabled = true;

  constructor(extension: vscode.ExtensionContext, projects: ExpoProjectCache) {
    super(extension, projects, manifestPattern);
    this.isEnabled = isManifestFileReferencesEnabled();

    extension.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(() => {
        this.isEnabled = isManifestFileReferencesEnabled();
      })
    );
  }

  provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken) {
    const links: vscode.DocumentLink[] = [];

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
      const plugin = resolvePluginInfo(project.root, nameValue);

      if (plugin) {
        const link = new vscode.DocumentLink(
          getDocumentRange(document, nameRange),
          vscode.Uri.file(plugin.pluginFile)
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
        const link = new vscode.DocumentLink(range, vscode.Uri.file(file));

        link.tooltip = 'Go to asset';
        links.push(link);
      }
    }

    return links;
  }
}
