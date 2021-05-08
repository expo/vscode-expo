const path = require('path');
const webpack = require('webpack');

module.exports = {
  target: 'node',
  entry: './src/extension.ts',
  output: {
    // Dirty workaround to allow us also building the `test` folder
    path: path.resolve(__dirname, 'out/src'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]',
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    parser: {
      javascript: {
        commonjsMagicComments: true,
      },
    },
    rules: [
      {
        test: /\.md|LICENSE$/,
        loader: 'raw-loader',
      },
      {
        test: /\.(ts|js)$/,
        loader: 'babel-loader',
        options: {
          presets: ['@expo/babel-preset-cli'],
        },
      },
    ],
  },
};
