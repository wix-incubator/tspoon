import * as ts from 'typescript';
import {Visitor} from "./visitor";
import {TranspilerContext} from "./transpiler-context";
import { traverseAst } from './traverse-ast';
import {MutableSourceCode} from "./mutable-source-code";

export interface Transformer {
	transform(ast: ts.SourceFile): ts.SourceFile;
}

export class VisitorTransformer implements Transformer {
	constructor(private visitors: Visitor[]) {

	}

	transform(ast: ts.SourceFile): ts.SourceFile {
		const parserErrors = this.getParserErrors(ast);
		if(parserErrors.length>0) {
			return null;
		}

		const context: TranspilerContext = new TranspilerContext();
		this.visitors.some((visitor) => {
			traverseAst(ast, visitor, context);
			return context.halted;
		});

		if(context.halted) {
			return null;
		}

		const mutable = new MutableSourceCode(ast);
		mutable.execute(context.insertions);
		console.log(mutable.code);
		return mutable.ast;

		// This intermediate code has to be transpiled by TypeScript

		//const compilerHost = new FileTranspilationHost(mutable.ast);
		//const program: ts.Program = ts.createProgram([fileName], compilerOptions, compilerHost);
		//const emitResult = program.emit();
        //
        //emitResult.diagnostics.forEach((d: ts.Diagnostic) => {
			//context.pushDiag(mutable.translateDiagnostic(d));
		//});


	}

	private getParserErrors(sourceFile: ts.SourceFile): ts.Diagnostic[] {
		// We're accessing here an internal property. It would be more legit to access it through
		// ts.Program.getSyntacticDiagsnostics(), but we want to bail out ASAP.
		return sourceFile['parseDiagnostics'];
	}
}


