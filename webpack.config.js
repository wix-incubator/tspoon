var webpack = require('webpack');
module.exports = {
	context: __dirname,
	devtool: 'eval',
	entry: {
		playground: ['./playground'],
		test: ['mocha!./test'],
	},
	node: {
		fs: 'empty'
	},
	output: {
		path     : __dirname + '/dist',
		filename : '[name].bundle.js',
		libraryTarget: 'umd',
		pathinfo: true
	},
	devServer: {
		contentBase: '/',
		inline: true,
		hot: true
	},
	module: {
		loaders: [
			{
				test    : /\.js$/,
				exclude : /node_modules/,
				loader  : 'babel-loader'
			}
		],
		noParse: /\.min\.js$/
	}
};
