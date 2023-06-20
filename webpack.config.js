const path = require('path');
const webpack = require('webpack');

/** @type {import('webpack').Configuration} */
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
  },
  externalsPresets: {
    node: true,
  },
  externals: [{ vscode: 'commonjs vscode' }],
  plugins: [
    new webpack.DefinePlugin({
      'process.env.VSCODE_EXPO_DEBUG': JSON.stringify(process.env.VSCODE_EXPO_DEBUG),
      'process.env.VSCODE_EXPO_TELEMETRY_KEY': JSON.stringify(
        process.env.VSCODE_EXPO_TELEMETRY_KEY
      ),
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      // Importing Sucrase with esm support causes default exports to break.
      // This forces the cjs import and use that as Sucrase in the bundle.
      // see: https://github.com/webpack/webpack/issues/5756#issuecomment-907080675
      sucrase: require.resolve('sucrase'),
    },
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
        test: /\.md|\.map|LICENSE$/,
        loader: 'raw-loader',
      },
      {
        test: /\.(ts|js)$/,
        loader: '@sucrase/webpack-loader',
        options: {
          transforms: ['typescript'],
        },
      },
    ],
  },
};
