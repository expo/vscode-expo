import path from 'path';

// This file is executed from `./out/test/jest`
const jestConfig = require('../../../jest.vscode');

// Tests are transpiled and executed from a different place than the source
const testDir = path.resolve(jestConfig.rootDir, jestConfig.roots[0]);
const sourceDir = path.resolve(jestConfig.rootDir, './src');

export const testPathForConsistencyCheck = 'example.test.js';

export function resolveSnapshotPath(testPath: string, snapExtension: string): string {
  if (testPath.startsWith(testDir)) {
    testPath = path.resolve(sourceDir, path.relative(testDir, testPath));
    testPath = path.join(path.dirname(testPath), '__snapshots__', path.basename(testPath));
  }

  return testPath + snapExtension;
}

export function resolveTestPath(snapPath: string, snapExtension: string) {
  if (snapPath.startsWith(sourceDir)) {
    snapPath = path.resolve(testDir, path.relative(sourceDir, snapPath));
  }

  return snapPath.replace('__snapshots__', '').replace(snapExtension, '');
}
