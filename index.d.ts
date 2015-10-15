import * as ts from "typescript";
import * as SourceMap from "source-map";
import { Insertion } from './src/mutable-source-code';

export interface TranspilerOutput {
    code: string,
    sourceMap: SourceMap.RawSourceMap,
    diags: ts.Diagnostic[],
    halted: boolean
}

export interface TranspilerConfig {
    sourceFileName: string;
    compilerOptions?: ts.CompilerOptions;
    visitors?: Visitor[];
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
