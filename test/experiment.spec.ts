/// <reference path="../typings/chai.d.ts" />
/// <reference path="../typings/mocha.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescriptServices.d.ts" />

import { expect, use } from 'chai';
import ts from 'typescript';

describe("AST", function() {
    it("has kind attribute", function() {

        var sourceCode = "class A { n: number = 3; }";
        var sourceFile = ts.createSourceFile("file.ts", sourceCode, ts.ScriptTarget.Latest, true);
        var statement = sourceFile.statements[0];
        var member = statement.members[0];
        var memberType = member.type;

        debugger;

        expect(statement.kind).to.equal(ts.SyntaxKind.ClassDeclaration);
        expect(memberType.kind).to.equal(ts.SyntaxKind.NumberKeyword);
    });
});
