/// <reference path="../../typings/chai.d.ts" />
/// <reference path="../../typings/mocha.d.ts" />
/// <reference path="../../typings/sinon.d.ts" />
/// <reference path="../../typings/sinon-chai.d.ts" />
/// <reference path="../../src/visitors/TyporamaVisitor.d.ts" />

import { expect, use } from 'chai';
import * as chai from 'chai';
import { tsToAst } from "../../test-kit/index";
import { Visitor, VisitContext } from "../../src/Visitor";
import { TyporamaVisitor } from "../../src/visitors/TyporamaVisitor";
import * as ts from "typescript";
import * as sinon from "sinon";

describe("typorama visitor", function() {
    it("doesn't touch class that doesn't extend typorama.BaseType", function() {
        var code = `
            class A {}
        `;
        var node: ts.Node = tsToAst(code);
        var visitor: Visitor = new TyporamaVisitor();
        var mockVisitContext = new VisitContext();
		var prependLineSpy : sinon.SinonSpy = sinon.spy();
		mockVisitContext.prependLine = prependLineSpy;
        visitor.visit(node, mockVisitContext);

		expect(prependLineSpy.callCount === 0).to.be.true;
    });
});
