/// <reference path="../typings/chai.d.ts" />
/// <reference path="../typings/mocha.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescriptServices.d.ts" />

import * as ts from 'typescript';
import { expect, use } from 'chai';
import {Visitor} from '../src/Visitor';
import {TSpoon} from '../src/TSpoon';


/*
 case 1 : simple e2e transpilation
 given a TS program with source files
 given visitors of annotation types

 the visitors visit all and only the class definitions that are relevent for them

 the visitors can insert changes to the target class
 the visitors can define diagnostic output
 the visitors can define failure to process

 ask for the emit of each file and get:
 code
 source-maps
 diagnostic
 error code


 case 2: ongoing changes
 as above

 given changes to input program's source
 ask for the emit of each file and get:
 code
 source-maps
 diagnostic
 error code
 */


const defaultOptions :ts.CompilerOptions  = {
	noEmitOnError: true,
	noImplicitAny: true,
	target: ts.ScriptTarget.ES5,
	module: ts.ModuleKind.CommonJS
};

class CompilationResult {
	diagnostics:ts.Diagnostic[];
	error:boolean;
	constructor( diagnostics:ts.Diagnostic[], error : boolean){
		this.diagnostics = diagnostics;
		this.error = error;
	}
}

function compile(program : ts.Program): CompilationResult {
	var emitResult = program.emit();

	var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

	allDiagnostics.forEach(diagnostic => {
		var { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
		var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
	});

	return new CompilationResult(allDiagnostics, emitResult.emitSkipped);
}

describe("e2e", ()=> {
	it('passes basic smoke test', () => {
		let program = ts.createProgram(['fixture1.ts'], defaultOptions);
		var tSpoon = new TSpoon(program, []);
		let result = compile(tSpoon.getIntermediateProgram());
	});
});
