var ts = require('typescript');
var tspoon = require("../dist/src");
var fs = require('fs');
var path = require('path');
var visitor = require('./deletePrivate');
var convertSourceMap = require('convert-source-map');

var config = {
    sourceFileName: 'src.ts',
    visitors: [visitor]
};
var sourceCode = fs.readFileSync(path.join(__dirname, 'src.ts'), 'utf8');
var transpilerOut = tspoon.transpile(sourceCode, config);
if (transpilerOut.diags) {
    transpilerOut.diags.forEach(function (d) {
		var position = d.file.getLineAndCharacterOfPosition(d.start);
		return console.log('->', d.file.fileName+':'+ (1+position.line)+':'+ position.character, ':',  d.messageText); });
}
if (transpilerOut.halted) {
    process.exit(1);
}
fs.writeFileSync(path.join(__dirname, 'src.js'), transpilerOut.code, {encoding:'utf8'});

var mapString = convertSourceMap.fromObject(transpilerOut.sourceMap).toJSON();

fs.writeFileSync(path.join(__dirname, 'src.js.map'), mapString, {encoding:'utf8'});

