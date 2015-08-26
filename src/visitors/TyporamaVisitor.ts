///<reference path="../../node_modules/typescript/lib/typescript.d.ts" />
///<reference path="../Visitor.d.ts" />

import { Visitor, VisitContext } from "../Visitor";
import * as ts from "typescript";

enum MemberType {
    Boolean, Number, String, Custom
}

class Member {
    name: string;
    type: MemberType;
    typeName: string;

    constructor(name: string, type: any) {
        this.name = name;
        switch(type.kind) {
            case ts.SyntaxKind.NumberKeyword:
                this.type = MemberType.Number;
                break;
            case ts.SyntaxKind.StringKeyword:
                this.type = MemberType.String;
                break;
            case ts.SyntaxKind.BooleanKeyword:
                this.type = MemberType.Boolean;
                break;
            case ts.SyntaxKind.TypeReference:
                this.type = MemberType.Custom;
                this.typeName = type.typeName.text;
                break;
        }
    }
}

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

        if(!this.isDecorated(classDeclaration)) {
            return;
        }

        var members = this.getMembers(classDeclaration);
        context.prependLine("@typorama.decorator(" + JSON.stringify(members) + ")");
        console.log("@typorama.decorator(" + JSON.stringify(members) + ")");
    }

    private isTypeSubclassOfBaseType(type: ts.Type): boolean {
        if(!type.symbol) {
            return false;
        }
        if(type.symbol.name == "BaseType") {
            return true;
        }
        var symbol = type.symbol;
        var flag = false;
        var thus = this;
        return symbol.declarations.reduce((f: boolean, d: ts.Declaration): boolean => {
            return f || d.kind != ts.SyntaxKind.ClassDeclaration &&
                thus.isSubclassOfBaseType(<ts.ClassLikeDeclaration>d);
        }, false);
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

    private getMembers(classDeclaration: ts.ClassLikeDeclaration): Array<Member> {
        var members: Array<Member> = [];
        var thus = this;
        classDeclaration.members.forEach(function(ce: any) {
            members.push(new Member(ce.name.getText(), ce.type));
        });
        return members;
    }

    private isDecorated(classDeclaration: ts.ClassLikeDeclaration): boolean {
        var thus = this;
        return classDeclaration.decorators && classDeclaration.decorators.reduce(
                (f: boolean, d: ts.Decorator): boolean => {
                    return f || d.expression && d.expression.text == "core3type";
                }, false);
    }
}
