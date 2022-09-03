import vscode from 'vscode';

import {
  getManifestFileReferencesConfig,
  isManifestFileReferencesEnabled,
  isManifestPluginValidationEnabled,
} from '../settings';

describe(isManifestPluginValidationEnabled, () => {
  afterEach(async () => {
    await vscode.workspace
      .getConfiguration('expo.appManifest')
      .update('pluginValidation', undefined);
  });

  it('returns true by default', () => {
    expect(isManifestPluginValidationEnabled()).toBe(true);
  });

  it('returns true when `expo.appManifest.pluginValidation` is true', async () => {
    await vscode.workspace.getConfiguration('expo.appManifest').update('pluginValidation', true);
    expect(isManifestPluginValidationEnabled()).toBe(true);
  });

  it('returns false when `expo.appManifest.pluginValidation` is false', async () => {
    await vscode.workspace.getConfiguration('expo.appManifest').update('pluginValidation', false);
    expect(isManifestPluginValidationEnabled()).toBe(false);
  });
});

describe(isManifestFileReferencesEnabled, () => {
  afterEach(async () => {
    await vscode.workspace.getConfiguration('expo.appManifest').update('fileReferences', undefined);
  });

  it('returns true by default', () => {
    expect(isManifestFileReferencesEnabled()).toBe(true);
  });

  it('returns true when `expo.appManifest.fileReferences` is true', async () => {
    await vscode.workspace.getConfiguration('expo.appManifest').update('fileReferences', true);
    expect(isManifestFileReferencesEnabled()).toBe(true);
  });

  it('returns false when `expo.appManifest.fileReferences` is false', async () => {
    await vscode.workspace.getConfiguration('expo.appManifest').update('fileReferences', false);
    expect(isManifestFileReferencesEnabled()).toBe(false);
  });
});

describe(getManifestFileReferencesConfig, () => {
  afterEach(async () => {
    const config = vscode.workspace.getConfiguration('expo.appManifest.fileReferences');
    await config.update('showHiddenFiles', undefined);
    await config.update('excludeGlobPatterns', undefined);
  });

  it('returns default object', () => {
    expect(getManifestFileReferencesConfig()).toMatchObject({
      showHiddenFiles: false,
      filesExclude: null,
    });
  });

  it('returns hidden files from `expo.appManifest.fileReferences.showHiddenFiles`', async () => {
    await vscode.workspace
      .getConfiguration('expo.appManifest.fileReferences')
      .update('showHiddenFiles', true);

    expect(getManifestFileReferencesConfig()).toHaveProperty('showHiddenFiles', true);
  });

  it('returns excluded files from `expo.appManifest.fileReferences.excludeGlobPatterns`', async () => {
    const excludedFiles = {
      '**/*.js': true,
      '.git/**': false,
    };

    await vscode.workspace
      .getConfiguration('expo.appManifest.fileReferences')
      .update('excludeGlobPatterns', excludedFiles);

    expect(getManifestFileReferencesConfig()).toHaveProperty(
      'filesExclude',
      expect.objectContaining(excludedFiles)
    );
  });
});
