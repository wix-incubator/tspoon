import { CompilerOptions, ModuleKind, JsxEmit, ScriptTarget } from 'typescript';
import { Visitor } from "./visitor";

export const defaultCompilerOptions: CompilerOptions = {
	module: ModuleKind.CommonJS,
	jsx: JsxEmit.React,
	target: ScriptTarget.ES5,
	experimentalDecorators: true,
	noEmitHelpers: true,
	sourceMap: true,
	preserveConstEnums : true,
	inlineSources : true,
	emitDecoratorMetadata: false
	// noLib : true
};
