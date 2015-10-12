/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>
/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../test-kit/matchers/matchers.d.ts" />

import { expect } from 'chai';
import * as chai from "chai";
import { getIntrospectionMetadata, printIntrospection } from '../src/schema-collector';
import * as ts from "typescript";
import matchCode from '../test-kit/matchers/match-code';
import transpileTo from '../test-kit/matchers/transpile-to';

chai.use(matchCode);
chai.use(transpileTo);

describe('type collector', ()=> {
    describe('collects introspection metadata', () => {
        it('for primitive types', () => {
            var source = `
                    @type
                    class Product {
                        title: string;
                        price: number;
                        flag: boolean;
                        private _shouldBeIgnored:string;
                    }
            `;
            var sourceFile = ts.createSourceFile('sample.tsx', source, ts.ScriptTarget.ES6, true);
            var metaData = getIntrospectionMetadata(sourceFile.statements.pop());
            expect(metaData).to.deep.equal({
                name: "Product",
                properties: [
                    {
                        name: "title",
                        type: "string"
                    },
                    {
                        name: "price",
                        type: "number"
                    },
                    {
                        name: "flag",
                        type: "boolean"
                    }
                ],
                methods: [],
                tags: ["@type"]
            });
        });

        it('for methods types', () => {
            var source = `
                    @type
                    class Product {
                        aMethod(n: number, s?: string, b: boolean): string {
                        }
                        private _shouldBeIgnored():void {}
                    }
            `;
            var sourceFile = ts.createSourceFile('sample.tsx', source, ts.ScriptTarget.ES6, true);
            var metaData = getIntrospectionMetadata(sourceFile.statements.pop());
            expect(metaData).to.deep.equal({
                name: "Product",
                methods: [
                    {
                        name: "aMethod",
                        params: [
                            {
                                name: "n",
                                type: "number",
                                optional: false
                            },
                            {
                                name: "s",
                                type: "string",
                                optional: true
                            },
                            {
                                name: "b",
                                type: "boolean",
                                optional: false
                            }
                        ],
                        type: "string"
                    }
                ],
                properties: [],
                tags: ["@type"]
            });
        });

        it('for complex types', () => {

            var source = `
                    @type
                    class Product {
                        p: Person;
                    }
            `;
            var sourceFile = ts.createSourceFile('sample.tsx', source, 1, true);
            var metaData = getIntrospectionMetadata(sourceFile.statements[0]);
            expect(metaData).to.deep.equal({
                name: "Product",
                properties: [
                    {
                        name: "p",
                        type: "Person"
                    }
                ],
                methods: [],
                tags: ["@type"]
            });
        });

        it('for method types', () => {

            var source = `
                    @type
                    class Product {
                        m: (n: number) => string;
                    }
            `;
            var sourceFile = ts.createSourceFile('sample.tsx', source, 1, true);
            var metaData = getIntrospectionMetadata(sourceFile.statements[0]);
            expect(metaData).to.deep.equal({
                name: "Product",
                properties: [
                    {
                        name: "m",
                        type: "Function",
                    }
                ],
                methods: [],
                tags: ["@type"]
            });
        });

		it('for class inheritance', () => {

			var source = `
					class ProductBase {}
                    class Product extends ProductBase implements MonkeyStaat {}
            `;
			var sourceFile = ts.createSourceFile('sample.tsx', source, 1, true);
			var metaData = getIntrospectionMetadata(sourceFile.statements[1]);
			expect(metaData).to.deep.equal({
				name: "Product",
				properties: [],
				methods: [],
				tags: [],
				"extends": "ProductBase"
			});
		});

		it('for static members', () => {

			var source = `
					class Product {
						static p: Person;
						static aMethod(): string {}
					}
            `;
			var sourceFile = ts.createSourceFile('sample.tsx', source, 1, true);
			var metaData = getIntrospectionMetadata(sourceFile.statements[0]);
			expect(metaData).to.deep.equal({
				name: "Product",
				properties: [
					{
						name: "p",
						type: "Person",
						isStatic: true
					}
				],
				methods: [
					{
						name: "aMethod",
						params: [],
						type: "string",
						isStatic: true
					}
				],
				tags: []
			});
		});
    });

    it('prints introspection helper', () => {
        var metadata = {
            name: "Product",
			"extends": "ProductBase",
            properties: [
                {
                    name: "n",
                    type: "number",
					isStatic: true,
                },
                {
                    name: "s",
                    type: "string"
                },
                {
                    name: "p",
                    type: "Person"
                }
            ],
            methods: [
                {
                    name: "aMethod",
                    params: [
                        {
                            name: "n",
                            type: "number",
                            optional: false
                        }
                    ],
                    type: "string",
                },
				{
					name: "bMethod",
					params: [],
					type: "string",
					isStatic: true
				}
            ],
            tags: ["@type"]
        };
        var code = printIntrospection(metadata, true);
        expect(code).to.matchCode(`
            {
                'name': "Product",
                'tags': ["@type"],
                'extends': ProductBase,
                'properties': [
                    {
                        'name': "n",
                        'type': typorama.Number,
                        'isStatic': true
                    },
                    {
                        'name': "s",
                        'type': typorama.String
                    },
                    {
                        'name': "p",
                        'type': Person
                    }
                ],
                'methods': [
                    {
                        'name': "aMethod",
                        'type': typorama.String,
                        'params': [
                            {
                                'name': "n",
                                'type': typorama.Number
                            }
                        ]
                    },
                    {
                        'name': "bMethod",
                        'type': typorama.String,
                        'params': [],
                        'isStatic': true
                    }
                ]
            }
        `);
    });
});
