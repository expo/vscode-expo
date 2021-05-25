import * as vscode from 'vscode';

import { parseMappings, replaceWorkspaceFolder, Mapping } from './getMapping';
import { getWorkfolderTsConfigConfiguration } from './getTsconfig';

export interface Config {
  autoSlash: boolean;
  mappings: Mapping[];
  showHiddenFiles: boolean;
  withExtension: boolean;
  absolutePathToWorkspace: boolean;
  filesExclude: Record<string, string>;
}

export async function getConfiguration(resource: vscode.Uri): Promise<Readonly<Config>> {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(resource);

  const getConfig = (key: string) => vscode.workspace.getConfiguration(key, resource);

  const cfgExtension = getConfig('expo-config-intellisense');
  const cfgGeneral = getConfig('files');

  const mappings = await getMappings(cfgExtension, workspaceFolder);

  return {
    autoSlash: cfgExtension['autoSlashAfterDirectory'],
    showHiddenFiles: cfgExtension['showHiddenFiles'],
    withExtension: cfgExtension['extensionOnImport'],
    absolutePathToWorkspace: cfgExtension['absolutePathToWorkspace'],
    filesExclude: cfgGeneral['exclude'],
    mappings,
  };
}

async function getMappings(
  configuration: vscode.WorkspaceConfiguration,
  workfolder?: vscode.WorkspaceFolder
): Promise<Mapping[]> {
  const mappings = parseMappings(configuration.mappings || {});
  const tsConfigMappings = await getWorkfolderTsConfigConfiguration(workfolder);
  const allMappings = [...mappings, ...tsConfigMappings];
  return replaceWorkspaceFolder(allMappings, workfolder);
}
