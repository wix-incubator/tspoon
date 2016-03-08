/// <reference path="../typings/tsd.d.ts" />

import { expect } from 'chai';
import * as chai from "chai";
import * as ts from "typescript";
import { MutableSourceCode, } from "../src/mutable-source-code";
import { traverseAst } from '../src/traverse-ast';
import { findCodeRange, findCodePosition } from "../test-kit/index";
import { FileTranspilationHost } from '../src/hosts';
import { defaultCompilerOptions } from '../src/configuration';
import { RawSourceMap, SourceMapConsumer, SourceMapGenerator } from 'source-map';
import {FastAppendAction} from "../src/mutable-source-code";
import {FastRewriteAction} from "../src/mutable-source-code";
import {ReplaceAction} from "../src/mutable-source-code";
import {InsertAction} from "../src/mutable-source-code";

function aSourceMapperFor(source: string): MutableSourceCode {
	const ast = ts.createSourceFile("test.ts", source, defaultCompilerOptions.target, true);
	return new MutableSourceCode(ast);
}

describe("Mutable source actions performs", function () {
	it("FastAppendAction at the end of source", ()=> {
		const source = "const someCode = 'Some string';";
		const mutableCode = aSourceMapperFor(source);
		mutableCode.execute([ new FastAppendAction('const b = 666;')]);
		expect(mutableCode.code).to.equal("const someCode = 'Some string';const b = 666;");
	});

	it("FastRewriteAction", function () {
		const source = "const someCode = 'Some string';";
		//              0123456789012345678901234567890
		//                        1         2         3
		const mutableCode = aSourceMapperFor(source);
		mutableCode.execute([ new FastRewriteAction(18, 'XXXXXXXXXXX')]);
		expect(mutableCode.code).to.equal("const someCode = 'XXXXXXXXXXX';");
	});

	it("ReplaceAction - replace style", function () {
		const source = "const someCode = 'Some string';";
		//              0123456789012345678901234567890
		//                        1         2         3
		const mutableCode = aSourceMapperFor(source);
		mutableCode.execute([ new ReplaceAction(6, 30, 'b = 666')]);
		expect(mutableCode.code).to.equal("const b = 666;");
	});

	it("InsertAction", function () {
		const source = "const someCode = 'Some string';";
		//              0123456789012345678901234567890
		//                        1         2         3
		const mutableCode = aSourceMapperFor(source);
		mutableCode.execute([ new InsertAction(6, '__')]);
		expect(mutableCode.code).to.equal("const __someCode = 'Some string';");
	});

	it("InsertAction (beginning)", function () {
		const source = "const someCode = 'Some string';";
		//              0123456789012345678901234567890
		//                        1         2         3
		const mutableCode = aSourceMapperFor(source);
		mutableCode.execute([ new InsertAction(0, '__')]);
		expect(mutableCode.code).to.equal("__const someCode = 'Some string';");
	});

	it("several actions in sequence", function () {
		const source = "const someCode = 'Some string';";
		//              0123456789012345678901234567890
		//                        1         2         3
		const mutableCode = aSourceMapperFor(source);
		mutableCode.execute([
			new ReplaceAction(6, 6, '__'),
			new FastAppendAction('const b = 666;'),
			new FastRewriteAction(18, 'XXXXXXXXXXX')
		]);
		expect(mutableCode.code).to.equal("const __someCode = 'XXXXXXXXXXX';const b = 666;");
	})


});



