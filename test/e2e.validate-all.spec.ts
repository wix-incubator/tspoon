import {expect} from 'chai';
import * as tspoon from '../src/index';
import * as ts from 'typescript';
import {ValidatorConfig} from "../src/transpile";
import {VisitorContext} from "../index";
import {VisitorBasedTransformer} from "../src/transformer";
import {Visitor} from "../src/visitor";
import {MockModule} from "../test-kit/mocks/resolution-hosts";

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

describe('tspoon.validateAll()', function () {
	it("lets valid code pass", function () {
		const config: ValidatorConfig = {
			resolutionHosts: [
				new MockModule('index.ts', 'export const perfectlyValid: number = 666;'),
				new MockModule('index2.ts', 'export const perfectlyValid2: number = 777;')
			]
		};
		expect(tspoon.validateAll(['index.ts', 'index2.ts'], config)).to.pass();
	});

	it("makes invalid code fail", function () {
		const config: ValidatorConfig = {
			resolutionHosts: [
				new MockModule('index.ts', 'export const perfectlyValid: number = 666;'),
				new MockModule('index2.ts', `
					// This comment here
					// is just
					// to add some lines
					export const perfectlyValid: number = 666;
					export const perfectlyInvalid: SomeWeirdType = "HAHAHA";
				`)
			]
		};
		expect(tspoon.validateAll(['index.ts', 'index2.ts'], config)).to.fail()
			.withMessageCount(1)
			.withMessage(/index2.ts -> 5:\d+ Cannot find name 'SomeWeirdType'./);
	});

	it("lets pass invalid code (modified by a visitor to a valid code)", function () {
		const config: ValidatorConfig = {
			resolutionHosts: [
				new MockModule('index.ts', `
					// This comment here
					// is just
					// to add some lines
					const perfectlyValid: number = 666;
					const perfectlyInvalid: SomeWeirdType = "HAHAHA";
				`)
			],

			mutators: [
				beforeVariable('perfectlyInvalid').insert('\ntype SomeWeirdType = string;')
			]
		};
		expect(tspoon.validateAll(['index.ts'], config)).to.pass();
	});

	it("preserves error lines despite the modifications", function () {
		const config: ValidatorConfig = {
			resolutionHosts: [
				new MockModule('index.ts', `
					// This comment here
					// is just
					// to add some lines
					const perfectlyValid: number = 666;
					const perfectlyInvalid: SomeWeirdType = "HAHAHA";
				`)
			],
			mutators: [
				beforeVariable('perfectlyInvalid').insert('\nconst anotherValidLine: number = 777;')
			]
		};
		expect(tspoon.validateAll(['index.ts'], config)).to.fail()
			.withMessageCount(1)
			.withMessage(/.* -> 5:\d+ Cannot find name 'SomeWeirdType'./);
	});

	it("modifies a dependency of the validated file", function () {
		const config: ValidatorConfig = {
			resolutionHosts: [
				new MockModule('index.ts', `
					import Product from './Product';
					const product: Product = { title: 'Sample' };
				`),
				new MockModule('Product.ts', `
					interface Product { title: string; }
					const somethingUnrelated: string = 'what?';
				`)
			],
			mutators: [
				beforeVariable('somethingUnrelated').insert('export default Product;')
			]
		};
		expect(tspoon.validateAll(['index.ts'], config)).to.pass();
	})

});
