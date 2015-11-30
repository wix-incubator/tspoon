import * as ts from 'typescript';
import {Visitor} from "./visitor";
import {TranspilerContext} from "./transpiler-context";
import { traverseAst } from './traverse-ast';
import {MutableSourceCode} from "./mutable-source-code";

export interface CodeTransformer {
	transform(ast: ts.SourceFile): MutableSourceCode;
}

export class VisitorBasedTransformer implements CodeTransformer {
	constructor(private visitors: Visitor[]) {}

	transform(ast: ts.SourceFile): MutableSourceCode {
		const parserErrors = this.getParserErrors(ast);
		if(parserErrors.length>0) {
			return null;
		}

		const context: TranspilerContext = new TranspilerContext();
		this.visitors.forEach((visitor) => {
			context.halted || traverseAst(ast, visitor, context);
		});

		if(context.halted) {
			return null;
		} else {
			const mutable = new MutableSourceCode(ast);
			mutable.execute(context.actions);
			return mutable;
		}
	}

	private getParserErrors(sourceFile: ts.SourceFile): ts.Diagnostic[] {
		// We're accessing here an internal property. It would be more legit to access it through
		// ts.Program.getSyntacticDiagsnostics(), but we want to bail out ASAP.
		return sourceFile['parseDiagnostics'];
	}
}


