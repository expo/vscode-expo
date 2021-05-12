import * as vscode from 'vscode';
import { Config, Mapping } from '../configuration';
import { getWorkfolderTsConfigConfiguration } from './getTsconfig';
import { parseMappings, replaceWorkspaceFolder } from './getMapping';

export async function getConfiguration(resource: vscode.Uri): Promise<Readonly<Config>> {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(resource);

  const getConfig = (key: string) => vscode.workspace.getConfiguration(key, resource);

  const cfgExtension = getConfig('path-intellisense');
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
  const mappings = parseMappings(configuration['mappings'] || {});
  const tsConfigMappings = await getWorkfolderTsConfigConfiguration(workfolder);
  const allMappings = [...mappings, ...tsConfigMappings];
  return replaceWorkspaceFolder(allMappings, workfolder);
}
