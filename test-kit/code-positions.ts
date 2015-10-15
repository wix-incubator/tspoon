/**
 * Created by gadig on 9/24/15.
 */

/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../typings/lodash/lodash.d.ts"/>

import * as SourceMap from 'source-map';
import * as _ from 'lodash';
import * as ts from "typescript";

export function findCodePosition(code: string, snippet: string): SourceMap.Position {
    var lines: string[] = code.split(/[\r\n]/);
    var lineNo = _.findIndex(lines, (line) => _.contains(line, snippet));
    if(lineNo > -1) {
        var column = (lineNo > -1) && lines[lineNo].indexOf(snippet);
        return {
            line: lineNo + 1,
            column: column
        };
    } else {
        return null;
    }
}

export function findCodeRange(code: string, snippet: string): ts.TextRange  {
    var pos = code.indexOf(snippet);
    return pos < 0 ? null : { pos, end: pos + snippet.length };
}
