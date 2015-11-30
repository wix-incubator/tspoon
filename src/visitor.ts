import * as ts from 'typescript';

export interface VisitorContext {
	halted: boolean;
	insertLine(position: number, str: string): void;
	replace(start: number, end: number, str: string): void;
	reportDiag(node: ts.Node, category: ts.DiagnosticCategory, message: string, halt?: boolean): void;
}

export interface Visitor {
	filter(node: ts.Node) : boolean;
	visit(node: ts.Node, context: VisitorContext): void;
}
