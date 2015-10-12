import { CompilerOptions, ModuleKind, JsxEmit, ScriptTarget } from 'typescript';
import { Visitor } from "./visitor";
import { MetadataVisitor } from "./metadata-visitor";
import { NominalTypingVisitor } from "./nominal-typing-visitor";
import { TyporamaSanitizerVisitor } from "./typorama-sanitizer-visitor";

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

export const defaultVisitors: Visitor[] = [
	new MetadataVisitor(),
	new NominalTypingVisitor(),
	new TyporamaSanitizerVisitor()
];
