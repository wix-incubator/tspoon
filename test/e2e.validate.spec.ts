import {expect} from 'chai';
import * as tspoon from '../src/index';
import * as ts from 'typescript';
import {ValidatorConfig} from "../src/transpile";
import {VisitorContext} from "../index";
import {VisitorBasedTransformer} from "../src/transformer";
import {Visitor} from "../src/visitor";

function beforeVariable(varName: string) {
	return {
		insert(code: string): Visitor {
			return {
				filter: (node:ts.Node) => {
					if (node.kind === ts.SyntaxKind.VariableDeclarationList) {
						const declList = <ts.VariableDeclarationList>node;
						return declList.declarations.some((decl:ts.VariableDeclaration) => decl.name.getText() === varName);
					}
					return false;
				},

				visit: (node:ts.Node, context:VisitorContext) => {
					context.insertLine(node.pos, code);
				}
			}
		}
	}
}

describe('tspoon.validate()', function () {
	it("lets valid code pass", function () {
		const source = 'const perfectlyValid: number = 666;';
		const ast:ts.SourceFile = tspoon.parse('sample.tsx', source);
		expect(tspoon.validate(ast, {})).to.pass();
	});

	it("makes invalid code fail", function () {
		const source = `
			// This comment here
			// is just
			// to add some lines
			const perfectlyValid: number = 666;
			const perfectlyInvalid: SomeWeirdType = "HAHAHA";
		`;
		const ast:ts.SourceFile = tspoon.parse('sample.tsx', source);
		expect(tspoon.validate(ast, {})).to.fail()
			.withMessageCount(1)
			.withMessage(/.* -> 5:\d+ Cannot find name 'SomeWeirdType'./);
	});

	it("lets pass invalid code (modified by a visitor to a valid code)", function () {
		const source = `
			// This comment here
			// is just
			// to add some lines
			const perfectlyValid: number = 666;
			const perfectlyInvalid: SomeWeirdType = "HAHAHA";
		`;
		const ast: ts.SourceFile = tspoon.parse('sample.tsx', source);
		const config: ValidatorConfig = {
			mutators: [
				beforeVariable('perfectlyInvalid').insert('\ntype SomeWeirdType = string;')
			]
		};
		expect(tspoon.validate(ast, config)).to.pass();
	});

	it("preserves error lines despite the modifications", function () {
		const source = `
			// This comment here
			// is just
			// to add some lines
			const perfectlyValid: number = 666;
			const perfectlyInvalid: SomeWeirdType = "HAHAHA";
		`;

		const ast: ts.SourceFile = tspoon.parse('sample.tsx', source);
		const config: ValidatorConfig = {
			mutators: [
				beforeVariable('perfectlyInvalid').insert('\nconst anotherValidLine: number = 777;')
			]
		};
		expect(tspoon.validate(ast, config)).to.fail()
			.withMessageCount(1)
			.withMessage(/.* -> 5:\d+ Cannot find name 'SomeWeirdType'./);
	});

});
