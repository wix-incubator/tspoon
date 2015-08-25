/// <reference path="../../node_modules/typescript/lib/typescript.d.ts" />
/// <reference path="../Visitor.d.ts" />
import { Visitor, VisitContext } from "../Visitor";
import * as ts from "typescript";
export declare class TyporamaVisitor extends Visitor {
    filter(node: ts.Node): boolean;
    visit(node: ts.Node, context: VisitContext): void;
}
