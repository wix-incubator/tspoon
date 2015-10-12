/**
 * Created by gadig on 9/20/15.
 */

/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../test-kit/matchers/matchers.d.ts" />

import { expect } from 'chai';
import * as chai from "chai";
import * as ts from 'typescript';
import { getIntrospectionMetadata, printIntrospection } from '../src/schema-collector';
import matchCode from '../test-kit/matchers/match-code';
import transpileTo from '../test-kit/matchers/transpile-to';
import { transpile } from "../src/transpile";
import { TyporamaSanitizerVisitor } from "../src/typorama-sanitizer-visitor";
import { defaultCompilerOptions, defaultVisitors } from '../src/configuration';
import * as traverse from '../src/traverse-ast';
import { applyVisitor } from "../test-kit/index";
import { DiagnosticMessages } from "../src/diagnostic-messages";

chai.use(matchCode);
chai.use(transpileTo);

describe("TyporamaSanitizerVisitor", ()=> {

    it("should never touch classes without core3 decorator", ()=> {

        const source = `
            class Test1 {
            }

            @fubarator
            class Test2 {
            }
        `;

        const result = applyVisitor(source, new TyporamaSanitizerVisitor());
        expect(result.diags).to.eql([]);
    });

    it("should not complain about legitimate typorama classes", ()=> {

        const source = `
            // blah blah
            @core3.type
            class Test extends A {
                n: number;
                s: string;
                b: boolean;
            }
        `;

        const result = applyVisitor(source, new TyporamaSanitizerVisitor());
        expect(result.diags).to.eql([]);
    });

    describe("should not allow", ()=> {

        it("implements on typorama classes", ()=> {

            const source = `
                @core3.type
                class Test extends A implements B {
                }
            `;

            const result = applyVisitor(source, new TyporamaSanitizerVisitor());
            expect(result.diags).to.deep.equal([
                {
                    category: ts.DiagnosticCategory.Error,
                    code: 0,
                    file: result.file,
                    length: 98,
                    start: 0,
                    messageText: DiagnosticMessages.TYPORAMA_IMPLEMENTS
                }
            ]);
        });

        it("static members", ()=> {

            const source = `
                @core3.type
                class Test {
                    static n: number;
                }
            `;

            const result = applyVisitor(source, new TyporamaSanitizerVisitor());
            expect(result.diags).to.deep.equal([
                {
                    category: ts.DiagnosticCategory.Error,
                    code: 0,
                    file: result.file,
                    length: 38,
                    start: 57,
                    messageText: DiagnosticMessages.TYPORAMA_STATIC
                }
            ]);
        });

        it("method functions", ()=> {

            const source = `
                @core3.type
                class Test {
                    foo() { blah(); }
                }
            `;

            const result = applyVisitor(source, new TyporamaSanitizerVisitor());
            expect(result.diags).to.deep.equal([
                {
                    category: ts.DiagnosticCategory.Error,
                    code: 0,
                    file: result.file,
                    length: 38,
                    start: 57,
                    messageText: DiagnosticMessages.TYPORAMA_METHODS
                }
            ]);
        });

        it("getters or setters", ()=> {

            const source = `
                @core3.type
                class Test {
                    get foo() { return 1 }
                    set foo(n) { }
                }
            `;

            const result = applyVisitor(source, new TyporamaSanitizerVisitor());
            expect(result.diags).to.deep.equal([
                {
                    category: ts.DiagnosticCategory.Error,
                    code: 0,
                    file: result.file,
                    length: 43,
                    start: 57,
                    messageText: DiagnosticMessages.TYPORAMA_ACCESSORS
                },
                {
                    category: ts.DiagnosticCategory.Error,
                    code: 0,
                    file: result.file,
                    length: 35,
                    start: 100,
                    messageText: DiagnosticMessages.TYPORAMA_ACCESSORS
                }
            ]);
        });
    });
});
