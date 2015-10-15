import * as ts from "typescript";
import * as SourceMap from "source-map";

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
