import * as vscode from 'vscode';

import {
  AndroidManifestCodeProvider,
  AndroidStringsCodeProvider,
  CodeProvider,
  EntitlementsPlistCodeProvider,
  GradlePropertiesCodeProvider,
  InfoPlistCodeProvider,
  IntrospectExpoConfigCodeProvider,
  PrebuildExpoConfigCodeProvider,
  PublicExpoConfigCodeProvider,
} from './IntrospectCodeProvider';

enum Command {
  OpenExpoFilePrebuild = 'expo.config.prebuild.preview',
  OpenExpoFileJsonPrebuild = 'expo.config.prebuild.preview.json',
  OpenExpoConfigPrebuild = 'expo.config.preview',
}

let extensionContext: vscode.ExtensionContext | null = null;

export function setupPreview(context: vscode.ExtensionContext) {
  extensionContext = context;
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(Command.OpenExpoConfigPrebuild, async (editor) => {
      const option = await vscode.window.showQuickPick(['public', 'prebuild', 'introspect']);
      if (option) {
        openForEditor(`config.${option}`, editor.document);
      }
    }),
    vscode.commands.registerTextEditorCommand(Command.OpenExpoFilePrebuild, async (editor) => {
      const option = await vscode.window.showQuickPick([
        'android.strings',
        'android.manifest',
        'android.gradleProperties',
        'ios.entitlements',
        'ios.infoPlist',
      ]);
      if (option) {
        openForEditor(option, editor.document);
      }
    }),
    vscode.commands.registerTextEditorCommand(Command.OpenExpoFileJsonPrebuild, async (editor) => {
      const option = await vscode.window.showQuickPick([
        'android.strings',
        'android.manifest',
        'android.gradleProperties',
        'ios.entitlements',
        'ios.infoPlist',
      ]);
      if (option) {
        openForEditor(option, editor.document, true);
      }
    })
  );
}

const CodeProviders: Record<string, any> = {
  'android.strings': AndroidStringsCodeProvider,
  'android.manifest': AndroidManifestCodeProvider,
  'android.gradleProperties': GradlePropertiesCodeProvider,
  'ios.entitlements': EntitlementsPlistCodeProvider,
  'ios.infoPlist': InfoPlistCodeProvider,
  'config.prebuild': PrebuildExpoConfigCodeProvider,
  'config.introspect': IntrospectExpoConfigCodeProvider,
  'config.public': PublicExpoConfigCodeProvider,
};

async function openForEditor(
  type: string,
  document: vscode.TextDocument,
  isJSON?: boolean
): Promise<void> {
  if (!(type in CodeProviders)) {
    throw new Error('invalid type: ' + type);
  }
  let codeProvider = codeProviders.get(type);
  if (codeProvider === undefined) {
    const Provider = CodeProviders[type];

    codeProvider = new Provider(document, { convertLanguage: isJSON ? 'json' : undefined })!;
    codeProviders.set(type, codeProvider!);
    if (extensionContext != null) {
      extensionContext.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(codeProvider!.scheme, codeProvider!)
      );
    }
  } else {
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
  vscode.window.showTextDocument(doc, column, true);
}
let lastCodeProvider: CodeProvider | undefined = undefined;
const codeProviders: Map<string, CodeProvider> = new Map();
