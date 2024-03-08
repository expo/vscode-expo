import { expect } from 'chai';
import { findNodeAtLocation } from 'jsonc-parser';
import vscode from 'vscode';

import { readWorkspaceFile } from '../../utils/file';
import { ExpoProjectCache, findProjectFromWorkspaces } from '../project';

describe('ExpoProjectCache', () => {
  it('adds disposable to extension context', () => {
    const subscriptions: any[] = [];
    using _projects = stubProjectCache(subscriptions);

    expect(subscriptions).to.have.length(1);
  });
});

describe('findProjectFromWorkspaces', () => {
  it('returns projct from workspace using relative path', () => {
    using projects = stubProjectCache();
    const project = findProjectFromWorkspaces(projects, './manifest');

    expect(project).to.exist;
  });

  it('returned project contains parsed package file', async () => {
    using projects = stubProjectCache();
    const project = await findProjectFromWorkspaces(projects, './manifest');

    expect(project?.package.tree).to.exist;
    expect(findNodeAtLocation(project!.package.tree, ['name'])!.value).to.equal('manifest');
  });

  it('returned project contains parsed expo manifest file', async () => {
    using projects = stubProjectCache();
    const project = await findProjectFromWorkspaces(projects, './manifest');

    expect(project?.manifest!.tree).to.exist;
    expect(findNodeAtLocation(project!.manifest!.tree, ['name'])!.value).to.equal('manifest');
  });
});

describe('ExpoProject', () => {
  it('returns expo version from package file', async () => {
    using projects = stubProjectCache();

    const project = await findProjectFromWorkspaces(projects, './manifest');
    const workspace = vscode.workspace.workspaceFolders![0];
    const packageUri = vscode.Uri.joinPath(workspace.uri, 'manifest', 'package.json');
    const packageFile = JSON.parse(await readWorkspaceFile(packageUri));

    expect(project?.expoVersion).to.equal(packageFile.dependencies.expo);
  });
});

function stubProjectCache(subscriptions: vscode.ExtensionContext['subscriptions'] = []) {
  const stubProjectCache = new ExpoProjectCache({ subscriptions });

  // @ts-expect-error
  stubProjectCache[Symbol.dispose] = () => stubProjectCache.dispose();

  return stubProjectCache as Disposable & typeof stubProjectCache;
}
