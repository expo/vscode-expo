import * as vscode from 'vscode';

import { getManifestFileReferencesConfig } from '../../../settings';
import { parseMappings, replaceWorkspaceFolder, Mapping } from './getMapping';
import { getWorkfolderTsConfigConfiguration } from './getTsconfig';

export interface Config
  extends Omit<ReturnType<typeof getManifestFileReferencesConfig>, 'mappings'> {
  mappings: Mapping[];
}

export async function getConfiguration(resource: vscode.Uri): Promise<Readonly<Config>> {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(resource);
  const config = getManifestFileReferencesConfig(resource);
  const mappings = await getMappings(config.mappings, workspaceFolder);

  return { ...config, mappings };
}

async function getMappings(
  configuredMappings?: Record<string, string> | null,
  workfolder?: vscode.WorkspaceFolder
): Promise<Mapping[]> {
  const mappings = parseMappings(configuredMappings || {});
  const tsConfigMappings = await getWorkfolderTsConfigConfiguration(workfolder);
  const allMappings = [...mappings, ...tsConfigMappings];
  return replaceWorkspaceFolder(allMappings, workfolder);
}
