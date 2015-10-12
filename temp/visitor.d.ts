/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />
import { Node, Diagnostic } from 'typescript';
export interface VisitContext {
    insertLine(node: Node, line: string): void;
    report(node: Node, diagnostics: Diagnostic, halt?: boolean): void;
}
export interface Visitor {
    filter(node: Node): boolean;
    visit(node: Node, context: VisitContext): void;
}
