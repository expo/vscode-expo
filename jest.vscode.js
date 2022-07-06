const path = require('path');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  verbose: true,
  restoreMocks: true,
  rootDir: path.resolve(__dirname),
  roots: ['./out/src'],
  testRegex: '__tests__/.*\\.(test|e2e)\\.[jt]sx?$',
};
