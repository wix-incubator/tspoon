/// <reference path="../typings/main.d.ts" />

import { expect } from 'chai';
import * as chai from "chai";
import * as ts from "typescript";
import { findCodeRange, findCodePosition } from "../test-kit/index";
import { defaultCompilerOptions } from '../src/configuration';
import { Visitor, VisitorContext, transpile, TranspilerOutput } from "../src/index";
import { traverseAst } from "../src/traverse-ast";
import { TranspilerContext } from "../src/transpiler-context";
import { MutableSourceCode } from "../src/mutable-source-code";

function applyVisitor(source: string, visitor: Visitor): TranspilerOutput {
    const ast = ts.createSourceFile("test.ts", source, defaultCompilerOptions.target, true);
    let context: TranspilerContext = new TranspilerContext(ast.fileName);
    traverseAst(ast, visitor, context);
    const mutable = new MutableSourceCode(ast);
    mutable.execute(context.actions);
    return {
        code: mutable.code,
        diags: context.diags,
        sourceMap: mutable.sourceMap,
        halted: context.halted
    };
}

function matchDiagRanges(expected: ts.TextRange, actual: ts.Diagnostic): void {
    chai.expect({
        start: expected.pos,
        end: expected.end
    }).to.eqls({
        start: actual.start,
        end: actual.start + actual.length
    });
}

describe("given source code", function () {

	describe("and a simple visitor, transpiler should", function () {
		const source = "\nclass A {}\nclass B {}\n";

		const fakeVisitor: Visitor = {
			filter: (node: ts.Node): boolean => {
				return node.kind == ts.SyntaxKind.ClassDeclaration;
			},
			visit: (node: ts.Node, context: VisitorContext): void => {
				context.insertLine(node.getStart(), "@blah");
				context.replace(node.getStart(), node.getStart() + 'class'.length, "interface");
				context.reportDiag(node, ts.DiagnosticCategory.Error, "Test message");
			}
		};

		let postVisitorOutput;

		beforeEach(()=>{
			postVisitorOutput = applyVisitor(source, fakeVisitor);
		});

		const target = "\n@blah\ninterface A {}\n@blah\ninterface B {}\n";

		it("generate the correct intermediate code", function () {
			chai.expect(postVisitorOutput.code).to.equal(target);
		});

		it("give correct diag positions", ()=> {

			chai.expect(postVisitorOutput.diags).to.have.length(2);

			matchDiagRanges(
				findCodeRange(source, "class A {}"),
				postVisitorOutput.diags[0]);

			matchDiagRanges(
				findCodeRange(source, "class B {}"),
				postVisitorOutput.diags[1]);
		});
	});

	describe("and a recursive visitor, transpiler should", function () {
		const source = "class A { methodA() {} }\nclass B { methodB() {} }";

		const subVisitor: Visitor = {
			filter: (node:ts.Node):boolean => {
				return node.kind == ts.SyntaxKind.MethodDeclaration;
			},
			visit: (node:ts.Node, context:VisitorContext):void => {
				context.insertLine(node.getStart(), "@blah");
			}
		};

		const fakeVisitor: Visitor = {
			filter: (node: ts.Node): boolean => {
				return node.kind == ts.SyntaxKind.ClassDeclaration;
			},
			visit: (node: ts.Node, context: VisitorContext, traverse: (...visitors: Visitor[])=> void): void => {
				traverse(subVisitor);
			}
		};

		let postVisitorOutput;

		beforeEach(()=>{
			postVisitorOutput = applyVisitor(source, fakeVisitor);
		});

		it("generate the correct intermediate code", function () {
			chai.expect(postVisitorOutput.code).to.equal(
				"class A { @blah\nmethodA() {} }\nclass B { @blah\nmethodB() {} }"
			);
		});
	});


});
