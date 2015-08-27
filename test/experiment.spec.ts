/// <reference path="../typings/chai.d.ts" />
/// <reference path="../typings/mocha.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescriptServices.d.ts" />

import { expect, use } from 'chai';
import ts = require("typescript");


describe("AST", function() {
    it("has kind attribute", function() {

        var sourceCode = "class A { n: number = 3; }";
        var sourceFile = ts.createSourceFile("file.ts", sourceCode, ts.ScriptTarget.Latest, true);
        var statement = sourceFile.statements[0];
//        var member = statement.members[0];
//        var memberType = member.type;

        expect(statement.kind).to.equal(ts.SyntaxKind.ClassDeclaration);
//        expect(memberType.kind).to.equal(ts.SyntaxKind.NumberKeyword);
    });
});

describe("Inheritence works for typorama objects", function() {

    function decoA(fields: Array<string>): any {
        return function(clazz: any) {
            if(!clazz.prototype.fields) {
                clazz.prototype.fields = [];
            }
            if(clazz.prototype.__proto__.fields) {
                clazz.prototype.fields = clazz.prototype.fields.concat(clazz.prototype.__proto__.fields);
            }
            clazz.prototype.fields = clazz.prototype.fields.concat(fields);
            return clazz;
        }
    }

    @decoA([])
    class Base {

    }

    @decoA(["field1"])
    class A extends Base{
        field1 : string;
    }

    @decoA(["field2"])
    class B extends A {
        field2 : string;
    }

    @decoA(["field2"])
    class C extends Base{
        field2:string;
    }

    var b: Base = new B();
    var c: Base = new C();

});
