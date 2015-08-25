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
import * as sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe("typorama visitor", function() {
    it("doesn't touch class that doesn't extend typorama.BaseType", function() {
        var code = `
            class A {}
        `;
        var node: ts.node = tsToAst(code);
        var visitor: Visitor = new TyporamaVisitor();
        var mockVisitContext = new VisitContext();
        mockVisitContext.prependLine = sinon.spy();
        visitor.visit(node, mockVisitContext);

        expect(mockVisitContext.prependLine).to.not.have.been.called();
    });
});
