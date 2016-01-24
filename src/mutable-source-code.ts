/// <reference path="../typings/source-map/source-map.d.ts"/>
/// <reference path="../typings/node/node.d.ts"/>
/// <reference path="../typings/magic-string/magic-string.d.ts"/>

import { RawSourceMap, SourceMapConsumer, SourceMapGenerator, MappedPosition } from 'source-map';
import * as ts from 'typescript';
import * as traverse from './traverse-ast';
import MagicString = require('magic-string');
import binarySearch from "./binary-search";

function compareActions(action1: Replacement, action2: Replacement): number {
	return action2.start - action1.start;
}

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
		const sortedActions = actionList.slice().sort(compareActions);
		sortedActions.forEach(action => {
			this.magicString.overwrite(action.start, action.end, action.str);
			const textSpan: ts.TextSpan = ts.createTextSpanFromBounds(action.start, action.end);
			const textChangeRange: ts.TextChangeRange = ts.createTextChangeRange(textSpan, action.str.length);
			this._ast = this._ast.update(this.magicString.toString(), textChangeRange);

		});
	}

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
		const map: RawSourceMap = this.magicString.generateMap({ source: this._ast.fileName, hires: true });
		const mapConsumer = new SourceMapConsumer(map);

		var fromSMC = new SourceMapConsumer(from);
		var resultMap = new SourceMapGenerator();
		resultMap.setSourceContent(intermediateAst.fileName, originalText);

		fromSMC.eachMapping(mapping => {
			var originalPosition: MappedPosition = mapConsumer.originalPositionFor({ line: mapping.originalLine, column: mapping.originalColumn });
			if(originalPosition.line != null) {
				resultMap.addMapping({
					source: intermediateAst.fileName,
					name: mapping.name,
					generated: {
						line: mapping.generatedLine,
						column: mapping.generatedColumn
					},
					original: originalPosition
				});
			}
		});
		return resultMap.toJSON();
	}

	translateDiagnostic(diag: ts.Diagnostic): ts.Diagnostic {
		const map: RawSourceMap = this.magicString.generateMap({ source: this._ast.fileName, hires: true });
		const cosumer: SourceMapConsumer = new SourceMapConsumer(map);
		const start: ts.LineAndCharacter = diag.file.getLineAndCharacterOfPosition(diag.start);
		const startPos: MappedPosition = cosumer.originalPositionFor({ line: start.line + 1, column: start.character });
		return {
			file: diag.file,
			start: diag.file.getPositionOfLineAndCharacter(startPos.line -1, startPos.column),
			length: diag.length,
			messageText: diag.messageText,
			category: diag.category,
			code: diag.code
		};

	}
}

