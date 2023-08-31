import path from 'path';

// This file is executed from `./out/test/mocha`
const rootDir = path.resolve(__dirname, '../../../');

// Snapshots do not exist in the `./out` directory,
// instead, it lives in the `./src/.../__tests__/__snapshots` directory.
const testDir = path.resolve(rootDir, './out/src');
const sourceDir = path.resolve(rootDir, './src');

const testPathForConsistencyCheck = 'example.test.js';

function resolveSnapshotPath(testPath: string, snapExtension: string): string {
  if (testPath.startsWith(testDir)) {
    testPath = path.resolve(sourceDir, path.relative(testDir, testPath));
    testPath = path.join(path.dirname(testPath), '__snapshots__', path.basename(testPath));
  }

  return testPath + snapExtension;
}

function resolveTestPath(snapPath: string, snapExtension: string) {
  if (snapPath.startsWith(sourceDir)) {
    snapPath = path.resolve(testDir, path.relative(sourceDir, snapPath));
  }

  return snapPath.replace('__snapshots__', '').replace(snapExtension, '');
}

export default {
  resolveSnapshotPath,
  resolveTestPath,
  testPathForConsistencyCheck,
};
