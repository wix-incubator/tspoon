/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />
///<reference path="../node_modules/typescript/lib/typescriptServices.d.ts"/>
import * as ts from 'typescript';

export class VisitContext {

	prependLine(line : string) : void {

	}

	report(diagnostics : ts.Diagnostic, halt? : boolean) : void {

	}
}

export class Visitor {

	filter(node : ts.Node) : boolean {
		return false;
	}
	visit(node : ts.Node, context : VisitContext) : void{

	}
}


export class TSpoon implements ts.Program{

	private _program:ts.Program;
	private _visitors:Array<Visitor>;

	constructor(program : ts.Program, visitors : Array<Visitor>){
		this._program = program;
		this._visitors = visitors;
	}
	getCompilerOptions(): ts.CompilerOptions{
		return this._program.getCompilerOptions();
	}
	getSourceFile(fileName: string): ts.SourceFile{
		return this._program.getSourceFile(fileName);
	}
	getCurrentDirectory(): string{
		return this._program.getCurrentDirectory();
	}
	getSourceFiles(){
		return this._program.getSourceFiles();
	}
	emit(targetSourceFile?: ts.SourceFile, writeFile?: ts.WriteFileCallback, cancellationToken?: ts.CancellationToken): ts.EmitResult{
		throw new Error('not implemented yet');
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
		throw new Error('not implemented yet');
	}
}
