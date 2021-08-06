const { ESBuildMinifyPlugin } = require('esbuild-loader');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

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
  optimization: {
    splitChunks: false,
    minimizer: [new ESBuildMinifyPlugin({ target: 'es2015' })],
  },
  externalsPresets: {
    node: true,
  },
  externals: [nodeExternals(), { vscode: 'commonjs vscode' }],
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
        // Workaround for files within libraries using dynamic require
        test: /\.md|LICENSE$/,
        loader: 'raw-loader',
      },
      {
        test: /\.(ts|js)$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'ts',
        },
      },
    ],
  },
};
