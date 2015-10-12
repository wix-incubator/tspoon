/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>

import * as SourceMap from 'source-map';
import { expect } from 'chai';
import * as _ from 'lodash';
import * as transpilerApi from '../../src/transpile';
import * as ts from "typescript";
import { findCodePosition } from "../code-positions";

function transpileTo(transpiled:transpilerApi.TranspilerOutput, sourceCode:string):Matchers.MapCodeFragment {
	var generatedCode = transpiled.code;
	var consumer:SourceMap.SourceMapConsumer = new SourceMap.SourceMapConsumer(transpiled.sourceMap);
	var sourceName:string = <any>_.first(transpiled.sourceMap.sources);
	expect(transpiled.sourceMap.sourcesContent[0].replace(/\n@typorama.type\(.*\)/g, '')).to.eql(sourceCode);
	var chain:Matchers.MapCodeFragment = {
		mapCodeFragment: function (originalSnippet:string):Matchers.GeneratedCode {
			return {
				toGeneratedCode: function (generatedSnippet = originalSnippet): Matchers.MapCodeFragment {
					var sourcePos:SourceMap.Position = findCodePosition(sourceCode, originalSnippet);
					if(!sourcePos) {
						throw new Error(`transpileTo() matcher: couldn\'t find the original snippet ${originalSnippet}`);
					}
					var originalPos:SourceMap.MappedPosition = <SourceMap.MappedPosition> _.extend({ source: sourceName }, sourcePos);
					var generatedPos: SourceMap.Position = findCodePosition(generatedCode, generatedSnippet);
					if(!generatedPos) {
						throw new Error(`transpileTo() matcher: couldn\'t find the generated snippet ${originalSnippet}`);
					}
					var mappedGeneratedPos:SourceMap.Position = consumer.generatedPositionFor(originalPos);
					expect(generatedPos.line).to.equal(mappedGeneratedPos.line);
					expect(generatedPos.column).to.equal(mappedGeneratedPos.column);
					return chain;
				}
			}
		},
		get to() {
			return chain;
		},
		get and() {
			return chain;
		}
	};
	return chain;

}

export default function (chai, util) {
	chai.Assertion.addMethod('transpileTo', function (sourceCode) {
		return transpileTo(sourceCode, this._obj);
	});
}
