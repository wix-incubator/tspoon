/// <reference path="../../typings/chai.d.ts" />
/// <reference path="../../typings/mocha.d.ts" />
/// <reference path="../../src/visitors/TyporamaVisitor.d.ts" />
/// <reference path="../../node_modules/typescript/lib/typescript.d.ts" />
/// <reference path="../../node_modules/typescript/lib/typescriptServices.d.ts"/>
/// <reference path="../../test-kit/mocks/typorama.d.ts" />

import { tsToAst, SimpleHost } from "../../test-kit/index";
import { Visitor, VisitContext } from "../../src/Visitor";
import { TyporamaVisitor } from "../../src/visitors/TyporamaVisitor";
import * as ts from "typescript";
import * as chai from 'chai';
import * as typorama from "../../test-kit/mocks/typorama";

function spy(fn: any) {
    var t: any;
    t = function (...args) {
        t.called = true;
        t.calledCount = 1 + t.calledCount ? t.calledCount : 0;
        t.args = args;
        t.ret = fn.apply(this, args);
        return t.ret;
    }
    t.called = false;
    t.calledCount = 0;
    return t;
}

describe("typorama visitor", function() {

    it("doesn't touch class that doesn't extend typorama.BaseType", function() {
        var code = `
            class A {}
        `;
        var node: ts.Node = tsToAst(code);
        var visitor: Visitor = new TyporamaVisitor();
        var mockVisitContext = new VisitContext();
        visitor.visit(node.statements[0], mockVisitContext);

        chai.expect(mockVisitContext.hasCahnges()).to.be.false;
    });

    it("makes changes to classes that extend typorama.BaseType", function() {
        var code = `
            import typorama from 'typorama';
            class A extends typorama.BaseType {}
        `;
        var node: ts.Node = tsToAst(code);
        var visitor: Visitor = new TyporamaVisitor();
        var mockVisitContext = new VisitContext();
        visitor.visit(node.statements[0], mockVisitContext);

        chai.expect(mockVisitContext.hasCahnges()).to.be.true;
    });

    it("adds the decorator @typorama to classes that extend typorama.BaseType", function() {
        var code = `
            import typorama from 'typorama';
            class A extends typorama.BaseType {}
        `;
        var node: ts.Node = tsToAst(code);
        var visitor: Visitor = new TyporamaVisitor();
        var mockVisitContext = new VisitContext();
        var tspy = mockVisitContext.prependLine = spy(mockVisitContext.prependLine);
        visitor.visit(node.statements[0], mockVisitContext);

        chai.expect(tspy.calledCount).to.equal(1);
        chai.expect(tspy.args).to.eql(["@typorama()"]);
    });

    it("calls decorator with type information", function() {

        var host: ts.CompilerHost = new SimpleHost({
            "typorama.d.ts": `
                export declare module typorama {
                    class BaseType {
                        setValue(p: any): void;
                    }
                }
            `,
            "typorama.tsx": `
                export module typorama {
                    export class BaseType {
                        setValue(p: any): void {
                        }
                    }
                }
            `,
            "index.ts": `
                /// <reference path="./typorama.d.ts" />
                import BaseType from './typorama';
                class A extends BaseType {
                    n: number = 3;
                    s: string = 'blah';
                }
            `,
            "dummy.ts": `
                /// <reference path="./typorama.d.ts" />
                import BaseType from './typorama';
                var foo: BaseType;
            `
        });

        var program: ts.Program = ts.createProgram(["index.ts"], {}, host);
        var da = program.getDeclarationDiagnostics();
        da.forEach(function(d) {
            console.log("#$%@#$%@#$%", d);
        });

        var visitor: Visitor = new TyporamaVisitor();
        var mockVisitContext = new VisitContext();
        var tspy = mockVisitContext.prependLine = spy(mockVisitContext.prependLine);
        var node: ts.Node = program.getSourceFile("index.ts");
        var statement = node.statements[1];
        var typeChecker = program.getTypeChecker();
        var expression = statement.heritageClauses[0].types[0].expression;
        var symbol = typeChecker.getSymbolAtLocation(expression);
        var type  = program.getTypeChecker().getTypeOfSymbolAtLocation(symbol, expression);

        console.log("\n\n\n****************\n\n\n");
        console.log("symbol:", symbol);
        console.log("\n\n\n****************\n\n\n");

        visitor.visit(statement, typeChecker, mockVisitContext);

        chai.expect(tspy.calledCount).to.equal(1);
        chai.expect(tspy.args).to.eql(["@typorama({'n':'number','s':'string','sa':'Array<string>'})"]);
    });
});
