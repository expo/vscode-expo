const path = require('path');

module.exports = {
	target: 'node',
	entry: './src/extension.ts',
	output: {
		path: path.resolve(__dirname, 'out'),
		filename: 'extension.js',
		libraryTarget: 'commonjs2',
		devtoolModuleFilenameTemplate: '../[resource-path]'
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
