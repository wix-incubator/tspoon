/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>

import { CompilerOptions, ModuleKind, JsxEmit, ScriptTarget, Diagnostic } from 'typescript';
import * as tspoon from "../dist/src";

const FILE_NAME = 'src.ts';

const config: tspoon.TranspilerConfig = {
	sourceFileName: FILE_NAME,
	compilerOptions: {
		declaration: false,
		module: ModuleKind.CommonJS,
		target: ScriptTarget.ES5,
		experimentalDecorators: true,
		noEmitHelpers: true,
		sourceMap: true,
		inlineSources : true,
		emitDecoratorMetadata: false,
		isolatedModules: true
	},
	visitors: [] // todo add stuff here
};

const sourceCode = require('fs').readFileSync(require('path').join(__dirname, FILE_NAME), 'utf8');

const transpilerOut = tspoon.transpile(sourceCode, config);

if (transpilerOut.diags){
	transpilerOut.diags.forEach((d:Diagnostic) => console.log(d.messageText));
}

if (transpilerOut.halted){
	process.exit(1);
}






function foo(s:string){
	console.log(s);
}

foo('hello world');
