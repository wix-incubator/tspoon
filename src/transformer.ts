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


}


