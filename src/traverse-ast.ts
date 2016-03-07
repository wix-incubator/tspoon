import * as ts from 'typescript';
import { Visitor, VisitorContext } from './visitor';

export function traverseAst(root: ts.Node, visitor: Visitor, context: VisitorContext): boolean {

	function traverse(node: ts.Node) {
		if(visitor.filter(node)) {
			visitor.visit(node, context, function () {});
			return context.halted || ts.forEachChild(node, traverse);
		}
		return ts.forEachChild(node, traverse);
	}

	return traverse(root);
}
