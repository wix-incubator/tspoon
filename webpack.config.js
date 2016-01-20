var webpack = require('webpack');
var path = require('path');

module.exports = {
	context: __dirname,
	devtool: 'eval',
	entry: {
	//	smarty: [path.join(__dirname, 'dist', 'smartypants.bundle.js')],
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
	resolve:{
		alias: {
		//	'tspoon': path.join(__dirname, 'dist', 'src', 'index.js'),
			'source-map-support' : path.join(__dirname, 'node_modules', 'source-map-support', 'browser-source-map-support')
		}
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
