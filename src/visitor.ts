/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>

import { Node, Diagnostic, DiagnosticCategory } from 'typescript';

export interface VisitorContext {
	halted: boolean;
	insertLine(position: number, str: string): void;
	reportDiag(node: Node, category: DiagnosticCategory, message: string, halt?: boolean): void;
}

export interface Visitor {
	filter(node: Node) : boolean;
	visit(node: Node, context: VisitorContext): void;
}
