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
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  module: {
    rules: [
      {
        loader: 'shebang-loader',
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
