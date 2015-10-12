/// <reference path="../typings/source-map/source-map.d.ts"/>
/// <reference path="../typings/node/node.d.ts"/>

import * as ts from 'typescript';
import { defaultCompilerOptions } from './configuration';
import { RawSourceMap } from 'source-map';

function fileExtensionIs(path: string, extension: string): boolean {
	let pathLen = path.length;
	let extLen = extension.length;
	return pathLen > extLen && path.substr(pathLen - extLen, extLen) === extension;
}

export class FileTranspilationHost implements ts.CompilerHost {
	private _output: string = 'NOT_SET';
	private _map: string = 'NOT_SET';

	constructor(private _ast: ts.SourceFile) {
	}

	public get output(): string {
		return this._output;
	}

	public get sourceMap(): RawSourceMap {
		return JSON.parse(this._map);
	}

	fileExists(fileName: string): boolean{
		return fileName === this._ast.fileName;
	}

	readFile(fileName: string): string{
		if(fileName === this._ast.fileName) {
			return this._ast.text;
		}
	}

	getSourceFile(fileName: string): ts.SourceFile {
		if(fileName === this._ast.fileName) {
			return this._ast;
		}
	}

	writeFile(name:string, text:string, writeByteOrderMark: boolean) {
		if(fileExtensionIs(name, 'map')) {
			this._map = text;
		} else {
			this._output = text;
		}
	}

	useCaseSensitiveFileNames() {
		return false;
	}

	getCanonicalFileName(fileName: string) {
		return fileName;
	}

	getCurrentDirectory() {
		return "";
	}

	getNewLine() {
		return (<any>ts).getNewLineCharacter(defaultCompilerOptions);
	}

	getDefaultLibFileName(options:ts.CompilerOptions): string {
		return "lib.d.ts";
	}

	getCancellationToken(): ts.CancellationToken {
		return null;
	}
}
