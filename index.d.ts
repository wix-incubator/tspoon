import * as ts from "typescript";
import {RawSourceMap} from "source-map";

export interface Insertion {
    position: number;
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
	resolutionHosts?: ts.ModuleResolutionHost[];
}

export interface VisitorContext {
    halted: boolean;
    insertLine(position: number, str: string): void;
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
    insertions: Insertion[];
    diags: ts.Diagnostic[];
}

export function applyVisitor(source: string, visitor: Visitor): ApplyVisitorResult;

export interface ValidatorConfig {
	resolutionHosts?: ts.ModuleResolutionHost[];
	visitors?: Visitor[];
}

export function parse(fileName: string, content: string, compilerOptions: ts.CompilerOptions): ts.SourceFile;

export function validate(ast: ts.SourceFile, config: ValidatorConfig): ts.Diagnostic[];
