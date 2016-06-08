import {expect} from 'chai';
import * as ts from 'typescript';
import * as tspoon from '../src/index';
import {ValidatorConfig} from '../src/transpile';
import {VisitorContext} from '../index';
import {Visitor} from '../src/visitor';
import {MockModule} from '../test-kit/mocks/resolution-hosts';

function beforeVariable(varName: string) {
    return {
        insert(code: string): Visitor {
            return {
                filter: (node: ts.Node) => {
                    if (node.kind === ts.SyntaxKind.VariableDeclarationList) {
                        const declList = <ts.VariableDeclarationList>node;
                        return declList.declarations.some((decl: ts.VariableDeclaration) => decl.name.getText() === varName);
                    }
                    return false;
                },

                visit: (node: ts.Node, context: VisitorContext) => {
                    context.insertLine(node.pos, code);
                }
            }
        }
    }
}

describe('tspoon.validateAll()', function() {
    it('lets valid code pass', function() {
        const config: ValidatorConfig = {
            resolutionHosts: [
                new MockModule('index.ts', 'export const perfectlyValid: number = 666;'),
                new MockModule('index2.ts', 'export const perfectlyValid2: number = 777;')
            ]
        };
        expect(tspoon.validateAll(['index.ts', 'index2.ts'], config)).to.pass();
    });

    it('makes invalid code fail', function() {
        const config: ValidatorConfig = {
            resolutionHosts: [
                new MockModule('index.ts', 'export const perfectlyValid: number = 666;'),
                new MockModule('index2.ts', `// This comment here
					// is just
					// to add some lines
					export const perfectlyValid: number = 666;
					export const perfectlyInvalid: SomeUndefinedType = 'HAHAHA';
				`)
            ]
        };
        expect(tspoon.validateAll(['index.ts', 'index2.ts'], config)).to.fail()
            .withMessageCount(1)
            .withMessage(/index2.ts -> 5:\d+ Cannot find name 'SomeUndefinedType'./);
    });

    it('lets invalid code that was fixed by a visitor pass', function() {
        const config: ValidatorConfig = {
            resolutionHosts: [
                new MockModule('index.ts', `
					// This comment here
					// is just
					// to add some lines
					const perfectlyValid: number = 666;
					const perfectlyInvalid: SomeUndefinedType = 'HAHAHA';
				`)
            ],

            mutators: [
                beforeVariable('perfectlyInvalid').insert('\ntype SomeUndefinedType = string;')
            ]
        };
        expect(tspoon.validateAll(['index.ts'], config)).to.pass();
    });

    it('preserves error lines despite the modifications', function() {
        const config: ValidatorConfig = {
            resolutionHosts: [
                new MockModule('index.ts', ` 									// line 1
					// This comment here     									// line 2
					// is just     									            // line 3
					// to add some lines     									// line 4
					const perfectlyValid: number = 666;     					// line 5
					const perfectlyInvalid: SomeUndefinedType = 'HAHAHA';     	// line 6
				`)
            ],
            mutators: [
                beforeVariable('perfectlyInvalid').insert('\nconst anotherValidLine: number = 777;')
            ]
        };
        expect(tspoon.validateAll(['index.ts'], config)).to.fail()
            .withMessageCount(1)
            .withMessage(/.* -> 6:\d+ Cannot find name 'SomeUndefinedType'./);
    });

    it('modifies a dependency of the validated file', function() {
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
    });

    it('fails gracefully with syntactically incorrect input', function() {
        const config: ValidatorConfig = {
            resolutionHosts: [
                new MockModule('index.ts', `
					import {Product} from './Product';
					const product: Product = { title: 'Sample'
				`),
                new MockModule('Product.ts', `
					export class Product { title: string; }
					const somethingUnrelated: string = 'what?';
				`)
            ]
        };
        expect(tspoon.validateAll(['index.ts'], config)).to.fail()
            .withMessage(/index.ts -> \d+:\d+ '}' expected./);
    });

    it('fails gracefully with syntactically incorrect dependency', function() {
        const config: ValidatorConfig = {
            resolutionHosts: [
                new MockModule('index.ts', `
					import {Product} from './Product';
					const product: Product = { title: 'Sample' }
				`),
                new MockModule('Product.ts', `
					export class Product { title: string; }
					const somethingUnrelated: string = 'what?
				`)
            ]
        };
        expect(tspoon.validateAll(['index.ts'], config)).to.fail()
            .withMessage(/Product.ts -> \d+:\d+ Unterminated string literal./);
    });

    it('can access semantic information', function() {
        this.timeout(10000);
        class MockVisitor implements Visitor {
            public realTypeName: string;

            filter(node: ts.Node): boolean {
                return node.getSourceFile().fileName === 'index.ts' && node.kind === ts.SyntaxKind.VariableDeclaration;
            }

            visit(node: ts.Node, context: VisitorContext): void {
                const ls: ts.LanguageService = context.getLanguageService();
                const x = ls.getTypeDefinitionAtPosition(node.getSourceFile().fileName, node.getStart());
                this.realTypeName = x[0].name;
            }
        }
        const visitor = new MockVisitor();
        const config: ValidatorConfig = {
            resolutionHosts: [
                new MockModule('a.ts', `
					export default class Product {}
				`),
                new MockModule('node_modules/lib/index.ts', ''),
                new MockModule('index.ts', `
                    import * as lib from 'lib';
					import {default as SomeClass} from './a';
					const a: SomeClass = null;
				`),
                new MockModule('lib.d.ts', require('typescript/lib/lib.d.ts'))
            ],
            mutators: [
                visitor
            ]
        };
        tspoon.validateAll(['index.ts'], config);
        expect(visitor.realTypeName).to.equal('Product');
    });
});
