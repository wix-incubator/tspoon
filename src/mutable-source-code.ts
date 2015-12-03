/// <reference path="../typings/source-map/source-map.d.ts"/>
/// <reference path="../typings/node/node.d.ts"/>
/// <reference path="../typings/magic-string/magic-string.d.ts"/>

import { RawSourceMap, SourceMapConsumer, SourceMapGenerator } from 'source-map';
import * as ts from 'typescript';
import * as traverse from './traverse-ast';
import MagicString = require('magic-string');
import binarySearch from "./binary-search";

export interface Replacement {
	start: number;
	end: number;
	str: string;
}

export class MutableSourceCode {

	private _ast: ts.SourceFile;
	private magicString: MagicString;
	private originalText: string;
	private origLineStarts: number[];

	constructor(ast: ts.SourceFile) {
		this._ast = ast;
		this.originalText = ast.text;
		this.magicString = new MagicString(ast.text);
		this.origLineStarts = ast.getLineStarts();
	}

	get ast(): ts.SourceFile {
		return this._ast;
	}

	execute(actionList: Array<Replacement>): void {
		actionList.forEach(action => {
		//	try {
				var start = this.locate(action.start);
				var end = this.locate(action.end);
				const textSpan: ts.TextSpan = ts.createTextSpanFromBounds(start, end);
				const textChangeRange: ts.TextChangeRange = ts.createTextChangeRange(textSpan, action.str.length);

			//	if (action.start === action.end){
			//		this.magicString.insert(this.magicString.locateOrigin(start), action.str);
			//	} else {
					this.magicString.overwrite(this.magicString.locateOrigin(start), this.magicString.locateOrigin(end), action.str);
			//	}
				this._ast = this._ast.update(this.magicString.toString(), textChangeRange);
			//} catch(e){
			//	debugger;
			//	console.log('magicString:\n', this.magicString.toString());
			//	console.log('ast:\n', this._ast.text);
			//	console.log('action:', action);
			//	console.log(e.message);
			//	console.log(e.stack);
			//	throw e;
			//}
		});
	}

	private locate(idx) {
		var result = this.magicString.locate(idx);
		if (result === null && idx > 0){
			result = this.magicString.locate(idx-1);
			if (result != null && false){
				result += 1;
			}
		}
		if (result === null && idx < this.magicString.toString().length){
			result = this.magicString.locate(idx+1);
			if (result != null && result > 0 && false){
				result -= 1;
			}
		}
		if (result === null){
			throw new Error( `Visitor referring an outdated location ${idx}`);
		}
		return result;
	};

	get sourceMap(): RawSourceMap {
		return this.magicString.generateMap({
			file: "file.ts",
			source: this._ast.text,
			includeContent: false
		});
	}

	get code(): string {
		return this._ast.text;
	}

	private findLineAndColumnOnOrigText(position: number) {
		let index = binarySearch(this.origLineStarts, position);
		return {
			line: index + 1,
			column: position - this.origLineStarts[index]
		};
	}

	translateMap(from: RawSourceMap): RawSourceMap {

		const originalText = this.originalText;
		const intermediateAst = this._ast;
		const magicString = this.magicString;

		var fromSMC = new SourceMapConsumer(from);
		var resultMap = new SourceMapGenerator();
		resultMap.setSourceContent(intermediateAst.fileName, originalText);

		fromSMC.eachMapping(mapping => {
			var positionOfLineAndCharacter = intermediateAst.getPositionOfLineAndCharacter(mapping.originalLine - 1, mapping.originalColumn);
			if(positionOfLineAndCharacter >= 0 && positionOfLineAndCharacter < magicString.toString().length) {
				var originalPosition = magicString.locateOrigin(positionOfLineAndCharacter); // this is slow
				if(originalPosition != null) {
					resultMap.addMapping({
						source: intermediateAst.fileName,
						name: mapping.name,
						generated: {
							line: mapping.generatedLine,
							column: mapping.generatedColumn
						},
						original: this.findLineAndColumnOnOrigText(originalPosition)
					});
				}
			}
		});
		return resultMap.toJSON();
	}

	translateDiagnostic(diag: ts.Diagnostic): ts.Diagnostic {
		const startPos: number = this.magicString.locateOrigin(diag.start);
		const endPos: number = this.magicString.locateOrigin(diag.start + diag.length);
		return {
			file: diag.file,
			start: startPos,
			length: endPos - startPos,
			messageText: diag.messageText,
			category: diag.category,
			code: diag.code
		};

	}
}

