/// <reference path="../typings/source-map/source-map.d.ts"/>
/// <reference path="../typings/node/node.d.ts"/>

import * as ts from 'typescript';
import {CodeTransformer} from "./transformer";
import {MutableSourceCode} from "./mutable-source-code";


function fileExtensionIs(path: string, extension: string): boolean {
	let pathLen = path.length;
	let extLen = extension.length;
	return pathLen > extLen && path.substr(pathLen - extLen, extLen) === extension;
}

export class HostBase implements ts.CompilerHost {
	fileExists(fileName: string): boolean{
		return false;
	}

	readFile(fileName: string): string{
		return null;
	}

	getSourceFile(fileName: string): ts.SourceFile {
		return null;
	}

	writeFile(name:string, text:string, writeByteOrderMark: boolean) {}

	useCaseSensitiveFileNames() {
		return false;
	}

	getCanonicalFileName(fileName: string) {
		return fileName;
	}

	getCurrentDirectory(): string {
		return "";
	}

	getNewLine(): string {
		return "\n";
	}

	getDefaultLibFileName(options:ts.CompilerOptions): string {
		return "lib.d.ts";
	}

	getCancellationToken(): ts.CancellationToken {
		return null;
	}
}

export class FileValidationHost extends HostBase implements ts.CompilerHost {
	private _transformations: { [fileName: string]: MutableSourceCode } = {};
	constructor(
		private _resolutionHosts: ts.ModuleResolutionHost[],
		private _compilerOptions: ts.CompilerOptions,
		private _transformer: CodeTransformer
	) {
		super();
	}

	fileExists(fileName: string): boolean{
		return this._resolutionHosts.some(host => host.fileExists(fileName));
	}

	readFile(fileName: string): string {
		return this._resolutionHosts.reduce<string>(
			(acc:string, host: ts.ModuleResolutionHost) => (!acc && host.fileExists(fileName))
				? host.readFile(fileName)
				: acc,
			null);
	}

	getSourceFile(fileName: string): ts.SourceFile {
		const source = this.readFile(fileName);
		if(source) {
			const ast: ts.SourceFile = ts.createSourceFile(fileName, source, this._compilerOptions.target, true);
			const transformation = this._transformer.transform(ast);
			this._transformations[ast.fileName] = transformation;
			return transformation.ast;
		} else {
			return null;
		}
	}

	translateDiagnostic(diagnostic: ts.Diagnostic): ts.Diagnostic {
		const transformation = this._transformations[diagnostic.file.fileName];
		return transformation ? transformation.translateDiagnostic(diagnostic) : diagnostic;
	}
}

export class FileTranspilationHost extends HostBase implements ts.CompilerHost {
	private _output: string = 'NOT_SET';
	private _map: string = 'NOT_SET';

	constructor(private _ast: ts.SourceFile) {
		super();
	}

	public get output(): string {
		return this._output;
	}

	public get sourceMap(): SourceMap.RawSourceMap {
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
}
