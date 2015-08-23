///<reference path="../node_modules/typescript/lib/typescriptServices.d.ts"/>
import ts from 'typescript';

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
	/**
	 * Get a list of files in the program
	 */
	getSourceFiles(){
		return this._program.getSourceFiles();
	}
	/**
	 * Emits the JavaScript and declaration files.  If targetSourceFile is not specified, then
	 * the JavaScript and declaration files will be produced for all the files in this program.
	 * If targetSourceFile is specified, then only the JavaScript and declaration for that
	 * specific file will be generated.
	 *
	 * If writeFile is not specified then the writeFile callback from the compiler host will be
	 * used for writing the JavaScript and declaration files.  Otherwise, the writeFile parameter
	 * will be invoked when writing the JavaScript and declaration files.
	 */
	emit(targetSourceFile?: SourceFile, writeFile?: WriteFileCallback, cancellationToken?: CancellationToken): EmitResult{

	}
	getOptionsDiagnostics(cancellationToken?: CancellationToken): Diagnostic[]{

	}
	getGlobalDiagnostics(cancellationToken?: CancellationToken): Diagnostic[]{

	}
	getSyntacticDiagnostics(sourceFile?: SourceFile, cancellationToken?: CancellationToken): Diagnostic[]{

	}
	getSemanticDiagnostics(sourceFile?: SourceFile, cancellationToken?: CancellationToken): Diagnostic[]{

	}
	getDeclarationDiagnostics(sourceFile?: SourceFile, cancellationToken?: CancellationToken): Diagnostic[]{

	}
	/**
	 * Gets a type checker that can be used to semantically analyze source fils in the program.
	 */
	getTypeChecker(): ts.TypeChecker {
		throw new Error('not implemented yet');
	}
}
