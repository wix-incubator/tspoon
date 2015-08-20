var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var _ = require('lodash');
var rootDir = path.resolve(__dirname, 'fixtures');

var warmUpRepetitions = 10;
var measureRepetitions = 10;

function getAuthorId() {
    return process.env.USER || process.env.LOGNAME || process.env.HOME;
}

function hrToMs(hr) {
    return (hr[0] * 1e3) + (hr[1] / 1e6);
}

function getChecksum(content) {
    var hash = crypto.createHash('sha1');
    hash.update(content, 'utf-8');
    return hash.digest('hex');
}

function measure(fileName) {
    console.log('Measuring ' + fileName);
    var content = fs.readFileSync(path.resolve(rootDir, fileName)).toString();
    var context = {
        sourceFileName: fileName,
        moduleFormat: ModuleFormats.NAIVE_CJS
    };

    // Warm up
    _.times(warmUpRepetitions, function () {

        // warm-up code

    });

    // Measure
    var t0 = process.hrtime();
    _.times(measureRepetitions, function () {

        // measure

    });
    var t1 = process.hrtime();

    return {
        fileName: fileName,
        checksum: getChecksum(content),
        time: (hrToMs(t1) - hrToMs(t0))/measureRepetitions
    };
}

console.log('Running benchmarks');
var list = fs.readdirSync(rootDir);
var report = {
    author: getAuthorId(),
    warmUpRepetitions: warmUpRepetitions,
    measureRepetitions: measureRepetitions,
    measurements: _.map(list, measure)
};

var reportFileName = 'report-' + new Date().getTime().toString() + '.json';
fs.writeFileSync(path.resolve(__dirname, 'reports', reportFileName), JSON.stringify(report, null, 4));

console.log('All done.');
