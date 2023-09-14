import { findNodeAtLocation } from 'jsonc-parser';
import vscode from 'vscode';

import { PluginDefiniton, getPluginDefinition, resolvePluginInfo } from './expo/plugin';
import { ExpoProjectCache } from './expo/project';
import { debug } from './utils/debug';
import { ExpoTextDocumentContentProvider } from './utils/vscode';

const log = debug.extend('manifest-plugin-schema');

export class ManifestPluginSchemaProvider extends ExpoTextDocumentContentProvider {
  constructor(extension: vscode.ExtensionContext, project: ExpoProjectCache) {
    super(extension, project, 'expo-plugin-schema');

    // TODO(cedric): hide behind debug flag
    extension.subscriptions.push(
      vscode.commands.registerTextEditorCommand('expo.manifest.plugin-schema', (editor) => {
        const uri = editor.document.uri.with({ scheme: 'expo-plugin-schema' });
        log('Opening manifest plugin schema for: ', uri);
        vscode.workspace
          .openTextDocument(vscode.Uri.parse('expo-plugin-schema://schemas/plugin-schema.json'))
          .then((document) => vscode.window.showTextDocument(document));
      })
    );
  }

  async provideTextDocumentContent(_uri: vscode.Uri, _token: vscode.CancellationToken) {
    // Find open document that matches `app.json` or `app.config.json``
    const editor = vscode.window.activeTextEditor;
    const document = editor?.document;
    const project = document && this.projects.fromUri(document.uri);
    if (!project?.manifest) {
      log('No project or manifest found');
      return;
    }

    const pluginsNode = findNodeAtLocation(project.manifest.tree, ['plugins']);
    if (!pluginsNode) {
      log('No plugin definition in manifest found');
      return;
    }

    if (pluginsNode.type !== 'array') {
      log('Not proper written');
      return;
    }
    if (!pluginsNode.children?.length) {
      log('No plugins listed');
      return;
    }

    const plugins = pluginsNode.children!.map((plugin) => getPluginDefinition(plugin));

    const pluginSchema = createPluginSchema(project.root, plugins);
    const schema = JSON.stringify(wrapSchemaInExpoRoot(pluginSchema), null, 2);

    log('Generated plugin schema for plugins', plugins.length);

    return schema;
  }
}

function createPluginSchema(projectRoot: string, definitions: PluginDefiniton[]) {
  const pluginInfo = definitions.map((definition) => ({
    ...(resolvePluginInfo(projectRoot, definition.nameValue) || {}),
    pluginName: definition.nameValue,
  }));

  const schema = pluginInfo.map((info) => {
    // Create generic schema
    if (!info.pluginSchema) {
      return {
        oneOf: [
          { enum: [info.pluginName] },
          {
            type: 'array',
            additionalItems: true,
            minItems: 1,
            items: [{ enum: [info.pluginName] }],
          },
        ],
      };
    }

    const hasRequiredProperties = !!(info.pluginSchema! as any).required?.length;

    const definitionWithProperties = {
      type: 'array',
      description: (info.pluginSchema! as any).description,
      markdownDescription: (info.pluginSchema! as any).markdownDescription,
      additionalItems: false,
      minItems: hasRequiredProperties ? 2 : 1,
      prefixItems: [{ enum: [info.pluginName] }, info.pluginSchema],
    };

    if (hasRequiredProperties) {
      return definitionWithProperties;
    }

    return {
      oneOf: [
        {
          enum: [info.pluginName],
          description: (info.pluginSchema! as any).description,
          markdownDescription: (info.pluginSchema! as any).markdownDescription,
        },
        definitionWithProperties,
      ],
    };
  });

  return {
    type: 'array',
    items: {
      anyOf: [
        ...schema,
        {
          oneOf: [
            { type: 'string' },
            {
              type: 'array',
              prefixItems: [{ type: 'string' }, { type: 'object' }],
            },
          ],
        },
      ],
    },
  };
}

/**
 * Wrap the plugin schema inside the root Expo schema.
 * This defines the possible `expo.plugins` or `plugins` structure.
 */
function wrapSchemaInExpoRoot(pluginSchema: object) {
  return {
    $schema: 'https://json-schema.org/draft/2019-09/schema',
    // $schema: 'http://json-schema.org/draft-07/schema',
    oneOf: [
      {
        type: 'object',
        required: ['expo'],
        additionalProperties: true,
        properties: {
          expo: { $ref: '#/$defs/ExpoRoot' },
        },
      },
      { $ref: '#/$defs/ExpoRoot' },
    ],
    $defs: {
      ExpoRoot: {
        type: 'object',
        required: ['plugins'],
        additionalItems: false,
        properties: {
          plugins: { $ref: '#/$defs/ExpoPlugins' },
        },
      },
      ExpoPlugins: pluginSchema,
    },
  };
}
