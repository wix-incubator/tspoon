var webpack = require('webpack');
var path = require('path');

module.exports = {
	context: __dirname,
	devtool: 'eval',
	entry: {
		app: [path.join(__dirname, 'dist', 'src', 'index.js')],
		webtest: ['mocha!'+ path.join(__dirname, 'dist', 'test', 'index.js')],
		test: [path.join(__dirname, 'dist', 'test', 'index.js')]
	},
	node: {
		fs: 'empty'
	},
	output: {
		path          : path.join(__dirname, 'dist'),
		filename      : '[name].bundle.js',
		libraryTarget : 'umd',
		pathinfo      : true
	},
	devServer: {
		contentBase: '/',
		inline: true,
		hot: true
	},
	module: {
		loaders: [
			{
				test    : /\.ts$/,
				loader  : 'raw-loader'
			},
			{
				test    : /\.json$/,
				loader  : 'json-loader'
			}
		],
		noParse: /\.min\.js$/
	}
};
