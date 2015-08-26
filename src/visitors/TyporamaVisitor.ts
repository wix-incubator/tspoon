///<reference path="../../node_modules/typescript/lib/typescript.d.ts" />
///<reference path="../Visitor.d.ts" />

import { Visitor, VisitContext } from "../Visitor";
import * as ts from "typescript";

export class TyporamaVisitor extends Visitor {

    private program: ts.Program;

    constructor(program: ts.Program) {
        super();
        this.program = program;
    }

    public filter(node: ts.Node): boolean {
        return false;
    }

    public visit(node: ts.Node, context: VisitContext): void {
        if(node.kind != ts.SyntaxKind.ClassDeclaration) {
            throw TypeError("Node is not a class declaration");
        }
        var classDeclaration = <ts.ClassDeclaration> node;
        if(!this.isSubclassOfBaseType(classDeclaration)) {
            return;
        }

        var members = this.getMembers(classDeclaration);
        context.prependLine("@typorama.decorator(" + JSON.stringify(members) + ")");
        console.log("@typorama.decorator(" + JSON.stringify(members) + ")");
    }

    private isTypeSubclassOfBaseType(type: ts.Type): boolean {
        if(type.symbol && type.symbol.name == "BaseType") {
            return true;
        }
        if(!type.symbol) {
            return false;
        }
        var symbol = type.symbol;
        var flag = false;
        var thus = this;
        symbol.declarations.forEach((d: ts.Declaration) => {
            if(d.kind != ts.SyntaxKind.ClassDeclaration) {
                flag = flag || thus.isSubclassOfBaseType(<ts.ClassLikeDeclaration>d);
            }
        });
        return true;
    }

    private isSubclassOfBaseType(classDeclaration: ts.ClassLikeDeclaration): boolean {
        if(!classDeclaration.heritageClauses) {
            return false;
        }
        var type = this.program.getTypeChecker().getTypeAtLocation(classDeclaration);
        if(!type) {
            return false;
        }
        return this.isTypeSubclassOfBaseType(type);
    }

    private getMembers(classDeclaration: ts.ClassLikeDeclaration): Array<{ name: string, type: ts.Type }> {
        var members: Array<{ name: string, type: ts.Type }> = [];
        var thus = this;
        classDeclaration.members.forEach(function(ce: ts.ClassElement) {
            //console.log(ce)
            var name = ce.name.getText();
            var symbol = thus.program.getTypeChecker().getSymbolAtLocation(ce);
            var type = thus.program.getTypeChecker().getTypeAtLocation(ce);
            members.push({ name, type});
        });
        return members;
    }
}
