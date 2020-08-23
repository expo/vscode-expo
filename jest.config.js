const path = require('path');

module.exports = {
  verbose: true,
	rootDir: path.resolve(__dirname),
  roots: ['./out/src'],
  testEnvironment: './out/test/jest-vscode-environment.js',
  setupFiles: ['./out/test/jest-vscode-setup.js'],
};
