import * as ts from 'typescript';
import { Visitor } from './visitor';

export const defaultCompilerOptions: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.React,
    target: ts.ScriptTarget.ES5,
    experimentalDecorators: true,
    noEmitHelpers: true,
    sourceMap: true,
    preserveConstEnums: true,
    inlineSources: true,
    emitDecoratorMetadata: false
};
