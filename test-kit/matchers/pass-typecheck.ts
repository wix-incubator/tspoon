/// <reference path="../../typings/tsd.d.ts"/>
/// <reference path="../../node_modules/typescript/lib/typescript.d.ts"/>

import * as Chai from 'chai';
import * as ts from "typescript";
import * as configuration from '../../src/configuration';
import * as fsHost from '../mocks/fsHost';
import * as path from 'path';

function printMessage(messageText:string | ts.DiagnosticMessageChain):string {
	if(messageText["messageText"]) {
		return printMessage((<ts.DiagnosticMessageChain>messageText).messageText);
	} else {
		return messageText.toString();
	}
}

function printDiagnostics(diagnostics:ts.Diagnostic[]):string {

	return diagnostics.reduce((acc:string, diagnostic) => {
		return acc + diagnostic.start + ': ' + printMessage(diagnostic.messageText) + '\n\n';
	}, '');
}

function typeCheck(sourceCode:string):ts.Diagnostic[] {
	const sampleFileName = 'sampleFile.tsx';
	const host = new fsHost.LocalFsHost(process.cwd());
	host.mockFile(sampleFileName, sourceCode);
	host.mapFile('src/typorama.d.ts', () => require('raw!../../src/typorama.d.ts'));
	host.mapFile('src/basecomp.d.ts', () => require('raw!../../src/basecomp.d.ts'));
	host.mapFile('node_modules/typescript/lib/lib.d.ts', () => require('raw!typescript/lib/lib.d.ts'));
	const program = ts.createProgram([sampleFileName], configuration.defaultCompilerOptions, host);
	return program.getSemanticDiagnostics();
}

export default function (chai, util) {
	chai.Assertion.addMethod('passTypecheck', function () {
		const sourceCode:string = this._obj;
		const diagnostics = typeCheck(sourceCode);
		this.assert(diagnostics.length === 0,
			`Expected the source code ${sourceCode} to pass type check,
			 but it produced errors. ${printDiagnostics(diagnostics)}`,
			`Expected the source code ${sourceCode} not to pass type check.`
		);
	});
}
