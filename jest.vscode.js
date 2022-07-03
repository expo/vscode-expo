const path = require('path');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  verbose: true,
  restoreMocks: true,
  rootDir: path.resolve(__dirname),
  roots: ['./out/src'],
  testRunner: 'jest-circus/runner',
  testRegex: '__tests__/.*\\.(test|e2e)\\.[jt]sx?$',
  testEnvironment: './out/test/jest/environment.js',
  setupFilesAfterEnv: ['./out/test/jest/setup.js'],
};
