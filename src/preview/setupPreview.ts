import * as vscode from 'vscode';

import { CodeProvider } from './CodeProvider';
import {
  IntrospectExpoConfigCodeProvider,
  PrebuildExpoConfigCodeProvider,
  PublicExpoConfigCodeProvider,
} from './ExpoConfigCodeProvider';
import {
  AndroidColorsCodeProvider,
  AndroidColorsNightCodeProvider,
  AndroidManifestCodeProvider,
  AndroidStringsCodeProvider,
  AndroidStylesCodeProvider,
  EntitlementsPlistCodeProvider,
  ExpoPlistCodeProvider,
  GradlePropertiesCodeProvider,
  InfoPlistCodeProvider,
  PodfilePropertiesCodeProvider,
} from './IntrospectCodeProvider';
import { ExpoConfigType, PreviewCommand, PreviewModProvider } from './constants';
import { reporter, TelemetryEvent } from '../utils/telemetry';

export const ModProviders: Record<string, typeof CodeProvider> = {
  [PreviewModProvider.iosInfoPlist]: InfoPlistCodeProvider,
  [PreviewModProvider.iosEntitlements]: EntitlementsPlistCodeProvider,
  [PreviewModProvider.iosExpoPlist]: ExpoPlistCodeProvider,
  [PreviewModProvider.iosPodfileProperties]: PodfilePropertiesCodeProvider,
  [PreviewModProvider.androidManifest]: AndroidManifestCodeProvider,
  [PreviewModProvider.androidStrings]: AndroidStringsCodeProvider,
  [PreviewModProvider.androidColors]: AndroidColorsCodeProvider,
  [PreviewModProvider.androidColorsNight]: AndroidColorsNightCodeProvider,
  [PreviewModProvider.androidStyles]: AndroidStylesCodeProvider,
  [PreviewModProvider.androidGradleProperties]: GradlePropertiesCodeProvider,
};

const CodeProviders: Record<string, typeof CodeProvider> = {
  ...ModProviders,
  'config.prebuild': PrebuildExpoConfigCodeProvider,
  'config.introspect': IntrospectExpoConfigCodeProvider,
  'config.public': PublicExpoConfigCodeProvider,
};

let extensionContext: vscode.ExtensionContext | null = null;
let lastCodeProvider: CodeProvider | undefined = undefined;
const codeProviders: Map<string, CodeProvider> = new Map();

export function setupPreview(context: vscode.ExtensionContext) {
  extensionContext = context;
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      PreviewCommand.OpenExpoConfigPrebuild,
      async (editor, _, option?: string) => {
        if (!option) {
          option = await vscode.window
            .showQuickPick([
              {
                label: ExpoConfigType.PREBUILD,
                description: 'Resolved plugins and added mods object for post-prebuild',
              },
              {
                label: ExpoConfigType.INTROSPECT,
                description: 'Evaluated results for static modifiers',
              },
              {
                label: ExpoConfigType.PUBLIC,
                description: 'Hosted manifest for OTA updates',
              },
            ])
            .then((item) => item?.label);
        }

        reporter?.sendTelemetryEvent(TelemetryEvent.PREVIEW_CONFIG, { option: option ?? '' });

        if (option) {
          return openForEditor(`config.${option}`, editor.document);
        }
      }
    ),
    vscode.commands.registerTextEditorCommand(
      PreviewCommand.OpenExpoFilePrebuild,
      async (editor, _, option?: string) => {
        if (!option) {
          option = await vscode.window
            .showQuickPick(
              Object.keys(ModProviders).map((key) => ({
                label: key,
                detail: (ModProviders[key] as any).fileDescription,
              }))
            )
            .then((item) => item?.label);
        }

        reporter?.sendTelemetryEvent(TelemetryEvent.PREVIEW_PREBUILD, { option: option ?? '' });

        if (option) {
          return openForEditor(option, editor.document);
        }
      }
    ),
    vscode.commands.registerTextEditorCommand(
      PreviewCommand.OpenExpoFileJsonPrebuild,
      async (editor, _, option?: string) => {
        if (!option) {
          option = await vscode.window
            .showQuickPick(
              Object.keys(ModProviders).map((key) => ({
                label: key,
                detail: (ModProviders[key] as any).fileDescription,
              }))
            )
            .then((item) => item?.label);
        }

        reporter?.sendTelemetryEvent(TelemetryEvent.PREVIEW_PREBUILD, {
          option: option ?? '',
          type: 'json',
        });

        if (option) {
          return openForEditor(option, editor.document, true);
        }
      }
    )
  );
}

async function openForEditor(
  type: string,
  document: vscode.TextDocument,
  isJSON?: boolean
): Promise<void> {
  if (!(type in CodeProviders)) {
    throw new Error('Invalid preview type: ' + type);
  }
  let codeProvider = codeProviders.get(type);
  if (codeProvider === undefined) {
    const Provider = CodeProviders[type];

    codeProvider = new Provider(document, { convertLanguage: isJSON ? 'json' : undefined } as any)!;
    codeProviders.set(type, codeProvider!);
    if (extensionContext != null) {
      extensionContext.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(codeProvider!.scheme, codeProvider!)
      );
    }
  } else {
    // Update settings
    codeProvider.options.convertLanguage = isJSON ? 'json' : undefined;
    codeProvider.setDocument(document);
  }

  let originalEditor: vscode.TextEditor | undefined;
  if (lastCodeProvider !== undefined) {
    const doc = lastCodeProvider.document;
    originalEditor = vscode.window.visibleTextEditors.find((e) => e.document === doc);
  }
  if (originalEditor === undefined) {
    originalEditor = vscode.window.activeTextEditor;
  }

  let column: number;
  if (originalEditor !== undefined && originalEditor.viewColumn !== undefined) {
    column = originalEditor.viewColumn + 1;
  } else {
    column = 0;
  }

  lastCodeProvider = codeProvider;

  await codeProvider!.update();
  const doc = await vscode.workspace.openTextDocument(codeProvider!.getURI());
  const editor = await vscode.window.showTextDocument(doc, column, true);

  codeProvider.setEditor(editor);
}
