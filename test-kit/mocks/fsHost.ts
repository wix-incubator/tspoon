/// <reference path="../../typings/source-map/source-map.d.ts"/>
/// <reference path="../../typings/node/node.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/typescript.d.ts"/>

import * as ts from 'typescript';
import * as path from 'path';
import { defaultCompilerOptions } from '../../src/configuration';

function isNode() {
	return typeof window === 'undefined';
}

export class LocalFsHost implements ts.CompilerHost {

	private _mockFileDict = {};

	constructor(private _rootDir:string) {
	}

	fileExists(fileName: string): boolean{
		return fileName in this._mockFileDict;
	}



	readFile(fileName:string):string {
		if(fileName in this._mockFileDict) {
			return this._mockFileDict[fileName];
		} else {

 		}
	}

	getSourceFile(fileName: string): ts.SourceFile {
		const content:string = this.readFile(fileName);
		if(content === null) {
			return null;
		} else {
			return ts.createSourceFile(fileName, this.readFile(fileName), ts.ScriptTarget.ES5);
		}
	}

	mockFile(name:string, content:string) {
		this._mockFileDict[name] = content;
	}

	mapFile(name:string, clientContentProvider:() => string) {
		if(isNode()) {
			this.mockFile(name, require('fs').readFileSync(path.resolve(this._rootDir, name)).toString());
		} else {
			this.mockFile(name, clientContentProvider());
		}
	}

	writeFile(name:string, text:string, writeByteOrderMark: boolean) {
		// No write, it's just a mock
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
		return "node_modules/typescript/lib/lib.d.ts";
	}

	getCancellationToken():ts.CancellationToken {
		return null;
	}
}
