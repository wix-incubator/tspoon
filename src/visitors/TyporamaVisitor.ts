///<reference path="../../node_modules/typescript/lib/typescript.d.ts" />
///<reference path="../Visitor.d.ts" />

import { Visitor, VisitContext } from "../Visitor";
import * as ts from "typescript";

export class TyporamaVisitor extends Visitor {

    public filter(node: ts.Node): boolean {
        return false;
    }

    public visit(node: ts.Node, context: VisitContext): void {
    }
}
