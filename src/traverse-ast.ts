import { Node, Diagnostic, DiagnosticCategory, SyntaxKind, forEachChild } from 'typescript';
import { Visitor, VisitorContext } from './visitor';

export function traverseAst(root: Node, visitor: Visitor, context: VisitorContext): boolean {

	function traverse(node: Node) {
		if(visitor.filter(node)) {
			visitor.visit(node, context);
			return context.halted || forEachChild(node, traverse);
		}
		return forEachChild(node, traverse);
	}

	return traverse(root);
}
