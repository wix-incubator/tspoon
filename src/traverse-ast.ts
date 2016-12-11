import ts = require('typescript');
import { Visitor, VisitorContext } from './visitor';

function descend(node: ts.Node, context: VisitorContext) {
    return function visit(...visitors: Visitor[]): void {
        visitors.forEach(visitor => {
            traverseAst(node, visitor, context);
        });
    }
}

export function traverseAst(root: ts.Node, visitor: Visitor, context: VisitorContext): boolean {

    function traverse(node: ts.Node) {
        if (visitor.filter(node)) {
            visitor.visit(node, context, descend(node, context));
            return context.halted || ts.forEachChild(node, traverse);
        }
        return ts.forEachChild(node, traverse);
    }

    return traverse(root);
}
