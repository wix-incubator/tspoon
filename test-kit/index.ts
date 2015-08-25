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

export class SimpleHost implements ts.CompilerHost {

    private sourceFiles: any;

    writeFile: ts.WriteFileCallback;

    constructor(_sourceFiles: any) {
        this.sourceFiles = _sourceFiles;
    }

    public getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile {
        return ts.createSourceFile(fileName, this.sourceFiles[fileName], ts.ScriptTarget.ES5, true);
    }

    public getDefaultLibFileName(options: ts.CompilerOptions): string {
        return "index.ts";
    }

    public getCurrentDirectory(): string {
        return "/";
    }

    public getCanonicalFileName(fileName: string): string {
        return fileName;
    }

    public useCaseSensitiveFileNames(): boolean {
        return true;
    }

    public getNewLine(): string {
        return "\n";
    }
}

