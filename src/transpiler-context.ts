/// <reference path="../typings/source-map/source-map.d.ts"/>

import { MutableSourceCode, Replacement } from './mutable-source-code';
import { Visitor, VisitorContext } from './visitor';
import * as ts from 'typescript';

export class TranspilerContext implements VisitorContext {

	private _halted = false;
	private _actions: Replacement[] = [];
	private _diags: ts.Diagnostic[] = [];

	isHalted(): boolean {
		return this._halted;
	}

	insertLine(position: number, str: string): void {
		this._actions.push({ start: position, end: position, str: str + "\n" });
	}

	replace(start: number, end: number, str: string): void {
		this._actions.push({ start, end, str });
	}

	reportDiag(node: ts.Node, category: ts.DiagnosticCategory, message: string, halt?: boolean): void {
		let diagnostic: ts.Diagnostic = {
			file: node.getSourceFile(),
			start: node.getStart(),
			length: node.getEnd() - node.getStart(),
			messageText: message,
			category: category,
			code: 0
		};
		this._diags.push(diagnostic);
		this._halted = this._halted || halt;
	}

	pushDiag(diagnostic: ts.Diagnostic): void {
		this._diags.push(diagnostic);
	}

	get actions(): Replacement[] {
		return this._actions;
	}

	get diags(): ts.Diagnostic[] {
		return this._diags;
	}

	get halted(): boolean {
		return this._halted;
	}
}
