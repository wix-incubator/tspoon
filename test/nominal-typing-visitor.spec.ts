/**
 * Created by gadig on 9/20/15.
 */

/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../test-kit/matchers/matchers.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>

import { expect } from 'chai';
import * as chai from "chai";
import { getIntrospectionMetadata, printIntrospection } from '../src/schema-collector';
import matchCode from '../test-kit/matchers/match-code';
import { passTypecheck } from "../test-kit/index";
import transpileTo from '../test-kit/matchers/transpile-to';
import { transpile } from "../src/transpile";
import { NominalTypingVisitor } from "../src/nominal-typing-visitor";
import { defaultCompilerOptions, defaultVisitors } from '../src/configuration';
import * as traverse from '../src/traverse-ast';
import { applyVisitor } from "../test-kit/index";
import * as ts from 'typescript';
import { FileTranspilationHost } from '../src/file-transpilation-host';

chai.use(matchCode);
chai.use(transpileTo);

describe("NominalTypingVisitor", function () {
	this.timeout(10000);

    it("should never touch classes without core3 decorator", function () {

        const source = `
            class Test1 {
            }

            @fubarator
            class Test2 {
            }
        `;

        const result = applyVisitor(source, new NominalTypingVisitor());
		expect(result.code).to.matchCode(source);
    });

    it("should not modify classes with no members", function () {

        const source = `
            @core3.type
            class Test {
            }
        `;

        const result = applyVisitor(source, new NominalTypingVisitor());
        expect(result.code).to.matchCode(source);
    });

    it("should add unique member to typorama classes", function () {

        const source = `
            const core3 = { type: null };
            @core3.type
            class Test {
                n: number;
            }
        `;

        const target = `
            const core3 = { type: null };
        	@core3.type
            class Test {
                __type_Test__;
                n: number;
            }
        `;

        const result = applyVisitor(source, new NominalTypingVisitor());
        expect(result.code).to.matchCode(target);
        expect(result.code).to.passTypecheck();
    });

    it("should prevent duck typing", function () {

        const source = `
            const core3 = { type: null };
            @core3.type
            class Test1 {
                n: number;
            }
            @core3.type
            class Test2 {
                n: number;
            }

            var t: Test1 = new Test2();
        `;

        const result = applyVisitor(source, new NominalTypingVisitor());

        expect(source).to.passTypecheck();
        expect(result.code).to.not.passTypecheck();
    });
});
