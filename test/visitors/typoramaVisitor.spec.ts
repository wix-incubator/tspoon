/// <reference path="../../typings/chai.d.ts" />
/// <reference path="../../typings/mocha.d.ts" />
/// <reference path="../../src/visitors/TyporamaVisitor.d.ts" />

import { tsToAst } from "../../test-kit/index";
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
        mockVisitContext.prependLine = spy(mockVisitContext.prependLine);
        visitor.visit(node, mockVisitContext);

        chai.expect((<any>mockVisitContext.prependLine).called).to.be.false;
    });
});
