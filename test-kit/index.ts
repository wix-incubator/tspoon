/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />
///<reference path="../node_modules/typescript/lib/typescriptServices.d.ts"/>

import * as ts from 'typescript';
//import * as esprima from 'esprima-fb';

export function tsToAst(code: string): ts.Node {
    return ts.createSourceFile("test.ts", code, ts.ScriptTarget.ES5, true);
}

/*
export function parseForCompare(code) {

    return esprima.parse(code, {
        loc: false,
        range: false,
        comment: true,
        tolerant: true,
        sourceType: 'module'
    });
}
*/

function printDiagnostic(d: ts.Diagnostic) {
    console.log(d.category, d.messageText, d.file?d.file.fileName:null, d.code);
}

export function printDiagnostics(program: ts.Program) {
    var da = program.getDeclarationDiagnostics();
    da.forEach((d) => {
        printDiagnostic(d)
    });
    var da = program.getGlobalDiagnostics();
    da.forEach((d) => {
        printDiagnostic(d)
    });
    var da = program.getOptionsDiagnostics();
    da.forEach((d) => {
        printDiagnostic(d)
    });
    var da = program.getSemanticDiagnostics();
    da.forEach((d) => {
        printDiagnostic(d)
    });
    var da = program.getSyntacticDiagnostics();
    da.forEach((d) => {
        printDiagnostic(d)
    });
}


