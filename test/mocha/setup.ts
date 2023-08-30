import chai from 'chai';
import chaiSubset from 'chai-subset';
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot';
import path from 'path';

// Configure Chai extensions
chai.use(chaiSubset);
chai.use(
  jestSnapshotPlugin({
    snapshotResolver: path.resolve(__dirname, './snapshots'),
  })
);
