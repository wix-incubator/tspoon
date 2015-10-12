/**
 * Created by gadig on 9/20/15.
 */

/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../test-kit/matchers/matchers.d.ts" />

import { expect } from 'chai';
import * as chai from "chai";
import { getIntrospectionMetadata, printIntrospection } from '../src/schema-collector';
import matchCode from '../test-kit/matchers/match-code';
import transpileTo from '../test-kit/matchers/transpile-to';
import { transpile } from "../src/transpile";
import { MetadataVisitor } from "../src/metadata-visitor";
import { defaultCompilerOptions, defaultVisitors } from '../src/configuration';
import * as traverse from '../src/traverse-ast';
import { applyVisitor } from "../test-kit/index";

chai.use(matchCode);
chai.use(transpileTo);

describe("MetadataVisitor", ()=> {

    it("should never touch classes without core3 decorator", ()=> {

        const source = `
            class Test1 {
            }

            @fubarator
            class Test2 {
            }
        `;

        const result = applyVisitor(source, new MetadataVisitor());
		expect(result.code).to.matchCode(source);
    });

    it("should add decorator with type information", ()=> {

        const source = `
            class Foo {}
            @core3.type
            class Test extends Foo {
                n: number;
                s: string;
                b: boolean;
                f: Foo;
            }
        `;

        const target = `
        	class Foo {}
        	@core3.type
            @core3.metadata({
                "name": "Test",
                "tags": ["@core3.type"],
                "extends": Foo,
                "properties": [
                    {
                        "name": "n",
                        "type": typorama.Number
                    },
                    {
                        "name": "s",
                        "type": typorama.String
                    },
                    {
                        "name": "b",
                        "type": typorama.Boolean
                    },
                    {
                        "name": "f",
                        "type": Foo
                    }
                ],
                "methods": []
            })
            class Test extends Foo {
                n: number;
                s: string;
                b: boolean;
                f: Foo;
            }
        `;

        const result = applyVisitor(source, new MetadataVisitor());
        expect(result.code).to.matchCode(target);
    });
});
