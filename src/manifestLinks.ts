import { findNodeAtLocation } from 'jsonc-parser';
import vscode from 'vscode';

import { getDynamicAssetReferences, getDynamicPluginDefinitions } from './expo/dynamicManifest';
import { getFileReferences, isDynamicManifestDocument, manifestPattern } from './expo/manifest';
import { getPluginDefinition, resolvePluginInfo } from './expo/plugin';
import { ExpoProjectCache } from './expo/project';
import { changedManifestFileReferencesEnabled, isManifestFileReferencesEnabled } from './settings';
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
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (changedManifestFileReferencesEnabled(event)) {
          this.isEnabled = isManifestFileReferencesEnabled();
        }
      })
    );
  }

  async provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken) {
    const links: vscode.DocumentLink[] = [];

    if (!this.isEnabled) return links;

    const project = await this.projects.fromManifest(document);
    if (!project) {
      log('Could not resolve project from manifest "%s"', document.fileName);
      return links;
    }

    if (isDynamicManifestDocument(document)) {
      for (const pluginDefinition of getDynamicPluginDefinitions(document)) {
        if (token.isCancellationRequested) return links;
        if (!pluginDefinition.nameValue) continue;

        const plugin = resolvePluginInfo(project.root.fsPath, pluginDefinition.nameValue);
        if (plugin) {
          const link = new vscode.DocumentLink(
            getDocumentRange(document, pluginDefinition.nameRange),
            vscode.Uri.file(plugin.pluginFile)
          );

          link.tooltip = 'Go to plugin';
          links.push(link);
        }
      }

      for (const reference of getDynamicAssetReferences(document)) {
        if (token.isCancellationRequested) return links;

        const link = new vscode.DocumentLink(
          getDocumentRange(document, reference.fileRange),
          vscode.Uri.joinPath(project.root, reference.filePath)
        );

        link.tooltip = 'Go to asset';
        links.push(link);
      }

      return links;
    }

    if (!project.manifest) {
      return links;
    }

    const plugins = findNodeAtLocation(project.manifest.tree, ['plugins']);
    const pluginsRange = plugins && getDocumentRange(document, plugins);

    // Create links for each defined plugins, if any
    for (const pluginNode of plugins?.children ?? []) {
      if (token.isCancellationRequested) return links;

      const { nameValue, nameRange } = getPluginDefinition(pluginNode);
      const plugin = resolvePluginInfo(project.root.fsPath, nameValue);

      if (plugin) {
        const link = new vscode.DocumentLink(
          getDocumentRange(document, nameRange),
          vscode.Uri.file(plugin.pluginFile)
        );

        link.tooltip = 'Go to plugin';
        links.push(link);
      }
    }

    // Create links for each defined assets, if any
    for (const reference of getFileReferences(project.manifest.content)) {
      if (token.isCancellationRequested) return links;

      const range = getDocumentRange(document, reference.fileRange);

      if (!pluginsRange?.contains(range)) {
        const link = new vscode.DocumentLink(
          range,
          vscode.Uri.joinPath(project.root, reference.filePath)
        );

        link.tooltip = 'Go to asset';
        links.push(link);
      }
    }

    return links;
  }
}
