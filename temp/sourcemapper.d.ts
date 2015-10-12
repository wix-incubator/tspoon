/// <reference path="../typings/source-map/source-map.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/magic-string/magic-string.d.ts" />
import { RawSourceMap } from 'source-map';
import * as ts from 'typescript';
import * as traverse from './traverse';
export default class SourceMapper {
    private _ast;
    private text;
    private originalText;
    private lineStarts;
    constructor(_ast: ts.SourceFile);
    ast: ts.SourceFile;
    exec(command: traverse.LinePush): void;
    lineAndColumnOnOrigTest(position: number): {
        line: number;
        column: number;
    };
    translateMap(from: RawSourceMap): RawSourceMap;
}
