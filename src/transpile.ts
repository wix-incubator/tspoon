/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>
/// <reference path="../typings/tsd.d.ts"/>

import { FileTranspilationHost, FileValidationHost } from './hosts';
import { traverseAst } from './traverse-ast';
import { MutableSourceCode, Insertion } from './mutable-source-code';
import { RawSourceMap, SourceMapConsumer } from 'source-map';
import { Visitor, VisitorContext } from './visitor';
import * as ts from 'typescript';
import { TranspilerContext } from "./transpiler-context";
import { defaultCompilerOptions } from "./configuration";
import {Transformer} from "./transformer";
import {VisitorTransformer} from "./transformer";

export interface TranspilerOutput {
	code: string,
	sourceMap: RawSourceMap,
	diags: ts.Diagnostic[],
	halted: boolean
}

export interface TranspilerConfig {
	sourceFileName: string;
	compilerOptions?: ts.CompilerOptions;
	visitors: Visitor[];
}

export interface ValidatorConfig {
	resolutionHosts?: ts.ModuleResolutionHost[];
	visitors?: Visitor[];
	transformers?: Visitor[];
}

function getParserErrors(sourceFile: ts.SourceFile): ts.Diagnostic[] {
	// We're accessing here an internal property. It would be more legit to access it through
	// ts.Program.getSyntacticDiagsnostics(), but we want to bail out ASAP.
	return sourceFile['parseDiagnostics'];
}



export function transpile(content: string, config: TranspilerConfig): TranspilerOutput {

	// The context may contain compiler options and a list of visitors.
	// If it doesn't, we use the default as defined in ./configuration.ts

	const compilerOptions = config.compilerOptions || defaultCompilerOptions;

	// First we initialize a SourceFile object with the given source code

	const fileName: string = config.sourceFileName + '.tsx';

	// Then we let TypeScript parse it into an AST

	const ast = ts.createSourceFile(fileName, content, compilerOptions.target, true);
	const parserErrors = getParserErrors(ast);
	if(parserErrors.length>0) {
		return {
			code: null,
			diags: parserErrors,
			halted: true,
			sourceMap: null
		}
	}

	// The context contains code modifications and diagnostics

	let context: TranspilerContext = new TranspilerContext();

	// We execute the various visitors, each traversing the AST and generating
	// lines to be pushed into the code and diagbostic messages.
	// If one of the visitors halts the transilation process we return the halted object.

	config.visitors.some((visitor) => {
		traverseAst(ast, visitor, context);
		return context.halted;
	});

	if(context.halted) {
		return {
			code: null,
			sourceMap: null,
			diags: context.diags,
			halted: true
		};
	}

	// Now, we mutate the code with the resulting list of strings to be pushed

	const mutable = new MutableSourceCode(ast);
	mutable.execute(context.insertions);

	// This intermediate code has to be transpiled by TypeScript

	const compilerHost = new FileTranspilationHost(mutable.ast);
	const program: ts.Program = ts.createProgram([fileName], compilerOptions, compilerHost);
	const emitResult = program.emit();

	emitResult.diagnostics.forEach((d: ts.Diagnostic) => {
		context.pushDiag(mutable.translateDiagnostic(d));
	});

	// If TypeScript did not complete the transpilation, we return the halted object

	if(emitResult.emitSkipped) {
		return {
			code: null,
			sourceMap: null,
			diags: context.diags,
			halted: true
		};
	}

	// If we got here, it means we have final source code to return

	const finalCode: string = compilerHost.output;
	const intermediateSourceMap = compilerHost.sourceMap;

	// The resulting sourcemap maps the final code to the intermediate code,
	// but we want a sourcemap that maps the final code to the original code,
	// so...

	const finalSourceMap: RawSourceMap = mutable.translateMap(intermediateSourceMap);

	// Now we return the final code and the final sourcemap

	return {
		code: finalCode,
		sourceMap: finalSourceMap,
		diags: context.diags,
		halted: false
	};
}

export function parse(fileName: string, content: string, compilerOptions: ts.CompilerOptions = defaultCompilerOptions): ts.SourceFile {
	return ts.createSourceFile(fileName, content, compilerOptions.target, true);
}

export function validate(ast: ts.SourceFile, config: ValidatorConfig): ts.Diagnostic[] {
	const transformer: Transformer = new VisitorTransformer(config.transformers || []);
	const compilerHost = new FileValidationHost(ast, config.resolutionHosts || [], defaultCompilerOptions, transformer);
	const program = ts.createProgram([ast.fileName], defaultCompilerOptions, compilerHost);
	let context: TranspilerContext = new TranspilerContext();
	config.visitors && config.visitors.forEach(visitor => traverseAst(ast, visitor, context));
	return program.getSemanticDiagnostics().concat(context.diags);
}
