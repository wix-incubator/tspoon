/// <reference path="../../typings/chai.d.ts" />
/// <reference path="../../typings/mocha.d.ts" />
/// <reference path="../../src/visitors/TyporamaVisitor.d.ts" />
/// <reference path="../../node_modules/typescript/lib/typescript.d.ts" />
/// <reference path="../../node_modules/typescript/lib/typescriptServices.d.ts"/>
/// <reference path="../../test-kit/mocks/typorama.d.ts" />
/// <reference path="../../test-kit/mocks/SimpleCompilerHost.d.ts" />

import { tsToAst, printDiagnostics } from "../../test-kit/index";
import { Visitor, VisitContext } from "../../src/Visitor";
import { TyporamaVisitor } from "../../src/visitors/TyporamaVisitor";
import * as ts from "typescript";
import * as chai from 'chai';
import * as typorama from "../../test-kit/mocks/typorama";
import SimpleCompilerHost from "../../test-kit/mocks/SimpleCompilerHost";

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

    it("doesn't touch classes that don't extend typorama.BaseType", function() {
        var host: ts.CompilerHost = new SimpleCompilerHost({
            "index.ts": "class A {}"
        });
        var program: ts.Program = ts.createProgram(["index.ts"], {}, host);
        printDiagnostics(program);
        var visitor: Visitor = new TyporamaVisitor(program);
        var mockVisitContext = new VisitContext();
        var node = program.getSourceFile("index.ts");
        visitor.visit(node.statements.pop(), mockVisitContext);

        chai.expect(mockVisitContext.hasChanges()).to.be.false;
    });

    it("makes changes to classes that extend typorama.BaseType", function() {
        var host: ts.CompilerHost = new SimpleCompilerHost({
            "index.ts": `
                module typorama { export class BaseType {}}
                class A extends typorama.BaseType {}
            `
        });
        var program: ts.Program = ts.createProgram(["index.ts"], {}, host);
        printDiagnostics(program);
        var visitor: Visitor = new TyporamaVisitor(program);
        var mockVisitContext = new VisitContext();
        var node = program.getSourceFile("index.ts");
        visitor.visit(node.statements.pop(), mockVisitContext);

        chai.expect(mockVisitContext.hasChanges()).to.be.true;
    });

    it("makes changes to classes with typorama.BaseType superclass", function() {
        var host: ts.CompilerHost = new SimpleCompilerHost({
            "index.ts": `
                module typorama { class BaseType {} }
                interface I {}
                class A extends typorama.BaseType {}
                class B extends A implements I {}
            `
        });

        var program: ts.Program = ts.createProgram(["index.ts"], {}, host);
        printDiagnostics(program);
        var visitor: Visitor = new TyporamaVisitor(program);
        var mockVisitContext = new VisitContext();
        var node = program.getSourceFile("index.ts");
        visitor.visit(node.statements.pop(), mockVisitContext);

        chai.expect(mockVisitContext.hasChanges()).to.be.true;
    });

    it("extracts members types into decorator", function() {
        var host: ts.CompilerHost = new SimpleCompilerHost({
            "index.ts": `
                module typorama { class BaseType {} }
                class A extends typorama.BaseType {
                    n: number;
                    s: string;
                    sa: Array<string>;
                }
            `
        });

        var program: ts.Program = ts.createProgram(["index.ts"], {}, host);
        printDiagnostics(program);
        var visitor: Visitor = new TyporamaVisitor(program);
        var mockVisitContext = new VisitContext();
        var node = program.getSourceFile("index.ts");
        visitor.visit(node.statements.pop(), mockVisitContext);

        chai.expect(mockVisitContext.hasChanges()).to.be.true;
    });
});

/*
module typorama { class BaseType {}}
interface I {}
class A extends typorama.BaseType {}
class B extends A implements I {}
*/