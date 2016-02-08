import * as ts from "typescript";
import {RawSourceMap} from "source-map";

export interface Replacement {
	start: number;
	end: number;
	str: string;
}

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

export interface VisitorContext {
	fileName: string;
	halted: boolean;
	insertLine(position: number, str: string): void;
	replace(start: number, end: number, str: string): void;
	reportDiag(node: ts.Node, category: ts.DiagnosticCategory, message: string, halt?: boolean): void;
}

export interface Visitor {
    filter(node: ts.Node): boolean;
    visit(node: ts.Node, context: VisitorContext): void;
}

export function transpile(content: string, config: TranspilerConfig): TranspilerOutput;

export interface ApplyVisitorResult {
	file: ts.SourceFile,
	code: string;
	actions: Replacement[];
	diags: ts.Diagnostic[];
}

export function applyVisitor(source: string, visitor: Visitor): ApplyVisitorResult;

export function applyVisitorOnAst(ast: ts.SourceFile, visitor: Visitor): ApplyVisitorResult;

export interface ValidatorConfig {
	resolutionHosts?: ts.ModuleResolutionHost[];
	visitors?: Visitor[];
	mutators?: Visitor[];
}

export function validateAll(files: string[], config: ValidatorConfig): ts.Diagnostic[];

export function traverseAst(root: ts.Node, visitor: Visitor, context: VisitorContext): boolean;
