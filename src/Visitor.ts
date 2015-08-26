///<reference path="../node_modules/typescript/lib/typescript.d.ts" />
///<reference path="../node_modules/typescript/lib/typescriptServices.d.ts"/>

import * as ts from 'typescript';

export class VisitContext {

	private hasChanges: boolean = false;

	public prependLine(line: string): void {
		this.hasChanges = true;
	}

	public report(diagnostics: ts.Diagnostic, halt?: boolean): void {
	}

	public hasCahnges(): boolean {
		return this.hasChanges;
	}
}

export class Visitor {

	public filter(node: ts.Node) : boolean {
		return false;
	}

	public visit(node: ts.Node, context: VisitContext): void {
	}
}
