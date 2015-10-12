/// <reference path="../typings/source-map/source-map.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import * as ts from 'typescript';
import { RawSourceMap } from 'source-map';

export declare class FileTranspilationHost implements ts.CompilerHost {
    private _ast;
    private _output;
    private _map;
    constructor(_ast: ts.SourceFile);
    output: string;
    sourceMap: RawSourceMap;
    fileExists(fileName: string): boolean;
    readFile(fileName: string): string;
    getSourceFile(fileName: string): ts.SourceFile;
    writeFile(name: string, text: string, writeByteOrderMark: boolean): void;
    useCaseSensitiveFileNames(): boolean;
    getCanonicalFileName(fileName: string): string;
    getCurrentDirectory(): string;
    getNewLine(): any;
    getDefaultLibFileName(options: ts.CompilerOptions): string;
    getCancellationToken(): ts.CancellationToken;
}
