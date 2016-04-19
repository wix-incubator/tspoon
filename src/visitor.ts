import * as ts from 'typescript';
import {Action} from './mutable-source-code';

/**
 * a transpilation actions API supplied to Visitor at visit time
 */
export interface VisitorContext {
    fileName: string;
	/**
	 * was the transpilation declared as failed by any previous visitor
	 */
    halted: boolean;
	/**
	 * add a text line at given position
	 * @param position position in code at which to insert line.
	 * @param str line to insert
	 */
    insertLine(position: number, str: string): void;

    /**
     * insert text at given position
     * @param position position in code at which to insert line.
     * @param str text to insert
     */
    insert(position: number, str: string): void;
    
	/**
	 * replace a piece of text in the code with a given new text
	 * @param start position in code of the first character to replace
	 * @param end position in code of the last character to replace. has to be greater or equal to the start param.
	 * @param str replacement string to insert instead of original state
	 */
    replace(start: number, end: number, str: string): void;
	/**
	 * report transpilation diagnostics
	 * @param node typescript AST node that relats to this diagnostic
	 * @param category severity of the diagnostic to report (could be error, warning or message)
	 * @param message txt of the diagnostic
	 * @param halt if true, the transpilation is declared as failed
	 */
    reportDiag(node: ts.Node, category: ts.DiagnosticCategory, message: string, halt?: boolean): void;

    fastAppend(str: string): void;
    fastRewrite(start: number, str: string): void;

    getLanguageService(): ts.LanguageService;
}

/**
 * single unit of transpilation logic
 */
export interface Visitor {
	/**
	 * predicate defining whether this visitor should operate on this node
	 * @param node typescript AST node
	 */
    filter(node: ts.Node): boolean;
	/**
	 * perform visitor logic on given node
	 * @param node typescript AST node for which filter(node) returnes true
	 * @param context transpilation actions handler for the current visit
	 */
    visit(node: ts.Node, context: VisitorContext, traverse: (...visitors: Visitor[]) => void): void;
}
