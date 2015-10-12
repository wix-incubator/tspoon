/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../node_modules/typescript/lib/typescript.d.ts"/>

import * as Chai from 'chai';
import {expect} from 'chai';
import * as typescript from 'typescript';
import syntaxKindMap from "../syntax-kind-map";

type Ast = typescript.SourceFile;

function parseForCompare(code:string):Ast {
	return typescript.createSourceFile('test.ts', code, typescript.ScriptTarget.ES5);
}

interface Parser {
	(source:string):Ast;
}

function checkParserSanity(parser:Parser) {
	var testSource = `
                import {mrMonkey} from "zoo";
                alert(mrMonkey);
            `;
	var ast:Ast = parser(testSource);
	expect(ast.kind).to.equal(typescript.SyntaxKind.SourceFile);
	expect(ast.statements.length).to.equal(2);
	expect(ast.statements[0].kind).to.equal(typescript.SyntaxKind.ImportDeclaration);
	expect(ast.statements[1].kind).to.equal(typescript.SyntaxKind.ExpressionStatement);
}

function matchCode(expectedCode:string, actualCode:string):void {
	checkParserSanity(parseForCompare);
	var actualAst:Ast = parseForCompare(actualCode);
	var expectedAst:Ast = parseForCompare(expectedCode);
	var expectedNodes: typescript.Node[] = [];

	function traverseAst(node: typescript.Node, cb: (node:typescript.Node)=> void) {
		function traverse(node: typescript.Node) {
			cb(node);
			typescript.forEachChild(node, traverse);
		}
		traverse(node);
	}
	traverseAst(expectedAst, (node: typescript.Node) => {
		expectedNodes.push(node);
	});
	traverseAst(actualAst, (actualNode: typescript.Node) => {
		var expectedNode = expectedNodes.shift();

		if(actualNode.kind != expectedNode.kind) {
			expect(actualNode).to.deep.equal(expectedNode);
		}

		expect(syntaxKindMap[actualNode.kind]).to.equal(syntaxKindMap[expectedNode.kind]);

		//	expect(actualNode.flags).to.equal(expectedNode.flags);

		if (~[typescript.SyntaxKind.Identifier,
				typescript.SyntaxKind.ArrayLiteralExpression,
				typescript.SyntaxKind.ObjectLiteralExpression,
				typescript.SyntaxKind.StringLiteral].indexOf(expectedNode.kind)){
			expect(actualNode['text']).to.equal(expectedNode['text']);
		}
		//	expect(actualNode['questionToken']).to.equal(expectedNode['questionToken']);
	});
	expect(expectedNodes).to.be.empty;
	//expect(actualAst).to.deep.equal(expectedAst, 'Expected ' + expectedCode + ' to be a code equivalent with ' + actualCode);
}

export default function (chai, util) {
	chai.Assertion.addMethod('matchCode', function (expectedCode:string) {
		matchCode(expectedCode, this._obj);
	});
}
