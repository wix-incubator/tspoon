/**
 * Created by gadig on 8/26/15.
 */

/// <reference path="../../node_modules/typescript/lib/typescript.d.ts" />
///<reference path="../../node_modules/typescript/lib/typescriptServices.d.ts"/>

import * as ts from 'typescript';

export default class SimpleCompilerHost implements ts.CompilerHost {

    private sourceFiles: any;

    writeFile: ts.WriteFileCallback;

    constructor(_sourceFiles: any) {
        this.sourceFiles = _sourceFiles;
    }

    public addSourceFile(fileName: string, code: string) {
        this.sourceFiles[fileName] = code;
    }

    public getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile {
        console.log("SimpleHost.getSourceFile: ", fileName);
        return ts.createSourceFile(
            fileName,
            this.sourceFiles[fileName] ? this.sourceFiles[fileName] : "",
            ts.ScriptTarget.ES5, true);
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
