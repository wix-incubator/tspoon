///<reference path="../../node_modules/typescript/lib/typescript.d.ts" />
///<reference path="../Visitor.d.ts" />

import { Visitor, VisitContext } from "../Visitor";
import * as ts from "typescript";

export class TyporamaVisitor extends Visitor {

    public filter(node: ts.Node): boolean {
        return false;
    }

    public visit(node: ts.Node, typeChecker: ts.TypeChecker, context: VisitContext): void {
        if(node.kind != ts.SyntaxKind.ClassDeclaration) {
            throw TypeError("Node is not a class declaration");
        }

        var symbol: ts.Symbol = typeChecker.getSymbolAtLocation(node);

    }
}

