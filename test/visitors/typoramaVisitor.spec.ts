/// <reference path="../../typings/chai.d.ts" />
/// <reference path="../../typings/mocha.d.ts" />
/// <reference path="../../src/visitors/TyporamaVisitor.d.ts" />
/// <reference path="../../node_modules/typescript/lib/typescript.d.ts" />
/// <reference path="../../node_modules/typescript/lib/typescriptServices.d.ts"/>

import { tsToAst, SimpleHost } from "../../test-kit/index";
import { Visitor, VisitContext } from "../../src/Visitor";
import { TyporamaVisitor } from "../../src/visitors/TyporamaVisitor";
import * as ts from "typescript";
import * as chai from 'chai';

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
        visitor.visit(node, mockVisitContext);

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
        visitor.visit(node, mockVisitContext);

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
        visitor.visit(node, mockVisitContext);

        chai.expect(tspy.calledCount).to.equal(1);
        chai.expect(tspy.args).to.eql(["@typorama()"]);
    });

    it("calls decorator with type information", function() {

        var host: ts.CompilerHost = new SimpleHost({
            "typorama.ts": `
                export module typorama {
                    export class BaseType {}
                }
            `,
            "index.ts": `
                import typorama from './typorama';
                class A extends typorama.BaseType {
                    n: number = 3;
                    s: string = 'blah';
                }
            `
        });

        debugger;

        var program: ts.Program = ts.createProgram(["index.ts"], {}, host);
        var visitor: Visitor = new TyporamaVisitor();
        var mockVisitContext = new VisitContext();
        var tspy = mockVisitContext.prependLine = spy(mockVisitContext.prependLine);
        visitor.visit(program.getSourceFiles()[0], mockVisitContext);

        chai.expect(tspy.calledCount).to.equal(1);
        chai.expect(tspy.args).to.eql(["@typorama({'n':'number','s':'string','sa':'Array<string>'})"]);
    });
});
