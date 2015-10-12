/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/through2/through2.d.ts" />

import {relative} from 'path';
import {obj} from 'through2';
var eventStream = require('event-stream');
import { transpile } from './index';
// import eventStream from 'event-stream';

export default function gulpPlugin(pluginContext) {
    return obj(function (file, enc, callback){
        var sourceFileName = relative(pluginContext.rootDir || process.cwd(), file.path)
            .replace(/[\\]/g, '/');

        var config  = {
            sourceFileName: sourceFileName,
            moduleFormat: pluginContext.moduleFormat
        };
        if(file.isStream()) {
            file.contents.pipe(eventStream.wait((err, sourceBuf) => {
                try {
                    var transpiled = transpile(sourceBuf, config);
                    var stream = obj();
                    stream.write(transpiled.code);
                    file.contents = file.contents.pipe(stream);
                    callback(null, file);
                } catch(ex) {
                    callback(ex);
                }
            }));
        } else {
            try {
                file.contents = new Buffer(transpile(file.contents.toString(), config).code);
                callback(null, file);
            } catch(ex) {
                callback(ex);
            }
        }
    });
}
