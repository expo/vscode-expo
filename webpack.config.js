const { ESBuildMinifyPlugin } = require('esbuild-loader');
const path = require('path');

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
  externals: [
    { vscode: 'commonjs vscode' },
    // Dirty workaround to prevent modules being bundled,
    // run `yarn webpack --mode development --stats-error-details` to update.
    '@babel/helper-regex',
    'emitter',
    'fsevents',
    /^webpack-hot-middleware/i,
    /^webpack-plugin-serve/i,
    // This library causes invalid JS, caused by https://github.com/jantimon/html-webpack-plugin/blob/8f8f7c53c4e4f822020d6da9de0304f8c23de08f/index.js#L133
    // Webpack both shortens the `require: require` -> `require` and replaces require with an internal `__webpack_require(xxx)`.
    // It's kinda stupid, `{ __webpack_require(xxx) }` is invalid, but we don't need this library within the bundle.
    'html-webpack-plugin',
  ],
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
