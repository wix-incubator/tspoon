/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />
///<reference path="../node_modules/typescript/lib/typescriptServices.d.ts"/>
import * as ts from 'typescript';
import _ from 'lodash';
import esprima from 'esprima-fb';

export function tsToAst(code: string): ts.Node {
    return ts.createSourceFile("test.ts", code, ts.ScriptTarget.ES5, true);
}


function findCodePosition(code, snippet) {
    var lines = code.split(/[\r\n]/);
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

export function parseForCompare(code) {

    return esprima.parse(code, {
        loc: false,
        range: false,
        comment: true,
        tolerant: true,
        sourceType: 'module'
    });
}
