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

