/// <reference path="../typings/source-map/source-map.d.ts"/>
/// <reference path="../typings/node/node.d.ts"/>
/// <reference path="../typings/magic-string/magic-string.d.ts"/>

import { RawSourceMap, SourceMapConsumer, SourceMapGenerator, MappedPosition } from 'source-map';
import * as ts from 'typescript';
import * as traverse from './traverse-ast';
import MagicString = require('magic-string');
import binarySearch from "./binary-search";

function compareActions(action1: Action, action2: Action): number {
	return action2.getStart() - action1.getStart();
}

export interface Action {
	getStart(): number;
	execute(ast: ts.SourceFile, magicString: MagicString): ts.SourceFile;
}

export class ReplaceAction {
	constructor(private start: number, private end: number, private str: string) {}
	execute(ast: ts.SourceFile, magicString: MagicString): ts.SourceFile {
		magicString.overwrite(this.start, this.end, this.str);
		const textSpan: ts.TextSpan = ts.createTextSpanFromBounds(this.start, this.end);
		const textChangeRange: ts.TextChangeRange = ts.createTextChangeRange(textSpan, this.str.length);
		return ast.update(magicString.toString(), textChangeRange);
	}

	getStart(): number {
		return this.start;
	}
}

export class FastAppendAction {
	constructor(private str: string) {}

	execute(ast: ts.SourceFile, magicString: MagicString): ts.SourceFile {
		const start = ast.text.length - 1;
		const textSpan: ts.TextSpan = ts.createTextSpanFromBounds(start, start);
		const textChangeRange: ts.TextChangeRange = ts.createTextChangeRange(textSpan, this.str.length);
		return ast.update(ast.text + this.str, textChangeRange);
	}

	getStart(): number {
		return Infinity;
	}
}

export class FastRewriteAction {
	constructor(private start: number, private str: string) {}

	execute(ast: ts.SourceFile, magicString: MagicString): ts.SourceFile {
		const textSpan: ts.TextSpan = ts.createTextSpanFromBounds(this.start, this.start + this.str.length);
		const textChangeRange: ts.TextChangeRange = ts.createTextChangeRange(textSpan, this.str.length);
		const newText = ast.text.slice(0,this.start) + this.str + ast.text.slice(this.start + this.str.length);
		return ast.update(newText, textChangeRange);
	}

	getStart(): number {
		return Infinity;
	}
}

export class MutableSourceCode {

	private _ast: ts.SourceFile;
	private magicString: MagicString;
	private originalText: string;
	private origLineStarts: number[];
	private _sourceMap: RawSourceMap;

	constructor(ast: ts.SourceFile) {
		this._ast = ast;
		this.originalText = ast.text;
		this.magicString = new MagicString(ast.text);
		this.origLineStarts = ast.getLineStarts();
	}

	get ast(): ts.SourceFile {
		return this._ast;
	}

	execute(actionList: Array<Action>): void {
		const sortedActions = actionList.slice().sort(compareActions);
		sortedActions.forEach((action: Action) => {
			this._ast = action.execute(this._ast, this.magicString);
		});
	}

	get sourceMap(): RawSourceMap {
		if(!this._sourceMap) {
			this._sourceMap = this.magicString.generateMap({ source: this._ast.fileName, hires: true });
		}
		return this._sourceMap;
	}

	get code(): string {
		return this._ast.text;
	}

	translateMap(from: RawSourceMap): RawSourceMap {
		const originalText = this.originalText;
		const intermediateAst = this._ast;

		const mapConsumer = new SourceMapConsumer(this.sourceMap);

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
		this._sourceMap = <RawSourceMap>resultMap.toJSON();
		return resultMap.toJSON();
	}

	translateDiagnostic(diag: ts.Diagnostic): ts.Diagnostic {
		const sourceMap: RawSourceMap = this.sourceMap;
		const cosumer: SourceMapConsumer = new SourceMapConsumer(sourceMap);
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

