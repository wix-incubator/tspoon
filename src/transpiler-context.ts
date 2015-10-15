/// <reference path="../typings/source-map/source-map.d.ts"/>

import { MutableSourceCode, Insertion } from './mutable-source-code';
import { Visitor, VisitorContext } from './visitor';
import { Node, DiagnosticCategory, Diagnostic, CompilerOptions, createSourceFile, createProgram } from 'typescript';

export class TranspilerContext implements VisitorContext {

	private _halted = false;
	private _insertions: Insertion[] = [];
	private _diags: Diagnostic[] = [];

	isHalted(): boolean {
		return this._halted;
	}

	insertLine(position: number, str: string): void {
		this._insertions.push({ position, str: str + "\n" });
	}

	reportDiag(node: Node, category: DiagnosticCategory, message: string, halt?: boolean): void {
		let diagnostic: Diagnostic = {
			file: node.getSourceFile(),
			start: node.pos,
			length: node.end - node.pos,
			messageText: message,
			category: category,
			code: 0
		};
		this._diags.push(diagnostic);
		this._halted = this._halted || halt;
	}

	pushDiag(diagnostic: Diagnostic): void {
		this._diags.push(diagnostic);
	}

	get insertions(): Insertion[] {
		return this._insertions;
	}

	get diags(): Diagnostic[] {
		return this._diags;
	}

	get halted(): boolean {
		return this._halted;
	}
}
