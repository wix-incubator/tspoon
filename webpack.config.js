var loaders = {
    loaders: [
        {
            test: /\.ts[x]?$/,
            loader: 'ts-loader?logLevel=warn'
        }
    ],
    noParse: /\.min\.js$/
};

var resolve = {
    extensions: ["", ".webpack.js", ".web.js", ".js", ".ts"]
};

var output = {
    path: __dirname + '/dist',
    filename: '[name].bundle.js',
    libraryTarget: 'umd',
    library: '[name]',
    pathinfo: true
};

module.exports = {
    context: __dirname,
    entry: {
        test: ['./test'],
        webtest: ['mocha-loader!./test']
    },
    devtool: 'inline-source-map',
    node: { fs: 'empty', module: 'empty' },
    output: output,
    resolve: resolve,
    module: loaders
};
