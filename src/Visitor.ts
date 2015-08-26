///<reference path="../node_modules/typescript/lib/typescript.d.ts" />
///<reference path="../node_modules/typescript/lib/typescriptServices.d.ts"/>

import * as ts from 'typescript';

export class VisitContext {

	private _hasChanges: boolean = false;
	private _lines: Array<string> = [];

	public prependLine(line: string): void {
		this._hasChanges = true;
		this._lines.push(line);
	}

	public report(diagnostics: ts.Diagnostic, halt?: boolean): void {
	}

	public hasChanges(): boolean {
		return this._hasChanges;
	}

	public getLines(): Array<string> {
		return this._lines;
	}
}

export class Visitor {

	public filter(node: ts.Node) : boolean {
		return false;
	}

	public visit(node: ts.Node, context: VisitContext): void {
	}
}
