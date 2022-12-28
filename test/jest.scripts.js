const path = require('path');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  verbose: true,
  restoreMocks: true,
  rootDir: path.resolve(__dirname, '..'),
  roots: ['./scripts'],
};
