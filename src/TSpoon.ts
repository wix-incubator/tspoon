/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />
///<reference path="../node_modules/typescript/lib/typescriptServices.d.ts"/>
import * as ts from 'typescript';
import {Visitor, VisitContext} from '../src/Visitor';


export class TSpoon {

	private _innerProgram:IntermediateProgram;

	constructor(program:ts.Program, visitors:Array<Visitor>) {
		this._innerProgram = new IntermediateProgram(program, visitors);
	}

	getIntermediateProgram():ts.Program {
		return this._innerProgram;
	}
}

class IntermediateProgram  implements ts.Program{

	private _innerProgram:ts.Program;
	private _visitors:Array<Visitor>;

	constructor(program:ts.Program, visitors:Array<Visitor>) {
		this._innerProgram = program;
		this._visitors = visitors;
	}

	getCompilerOptions(): ts.CompilerOptions{
		return this._innerProgram.getCompilerOptions();
	}
	getCurrentDirectory(): string{
		return this._innerProgram.getCurrentDirectory();
	}
	getSourceFile(fileName: string): ts.SourceFile{
		throw new Error('not implemented yet');
	}
	getSourceFiles(): ts.SourceFile[]{
		throw new Error('not implemented yet');
	}
	emit(targetSourceFile?: ts.SourceFile, writeFile?: ts.WriteFileCallback, cancellationToken?: ts.CancellationToken): ts.EmitResult{
		return this._innerProgram.emit(targetSourceFile, writeFile, cancellationToken);
	}
	getOptionsDiagnostics(cancellationToken?: ts.CancellationToken): ts.Diagnostic[]{
		throw new Error('not implemented yet');
	}
	getGlobalDiagnostics(cancellationToken?: ts.CancellationToken): ts.Diagnostic[]{
		throw new Error('not implemented yet');
	}
	getSyntacticDiagnostics(sourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken): ts.Diagnostic[]{
		throw new Error('not implemented yet');
	}
	getSemanticDiagnostics(sourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken): ts.Diagnostic[]{
		throw new Error('not implemented yet');
	}
	getDeclarationDiagnostics(sourceFile?: ts.SourceFile, cancellationToken?: ts.CancellationToken): ts.Diagnostic[]{
		throw new Error('not implemented yet');
	}
	getTypeChecker(): ts.TypeChecker {
		throw new Error('not gonna be implemented');
	}
}
