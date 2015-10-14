import { Diagnostic, DiagnosticCategory, CompilerOptions } from 'typescript';

export interface VisitorContext {
    halted: boolean;
    insertLine(position: number, str: string): void;
    reportDiag(node: Node, category: DiagnosticCategory, message: string, halt?: boolean): void;
}

export interface Visitor {
    filter(node: Node): boolean;
    visit(node: Node, context: VisitorContext): void;
}

export interface TranspilerOutput {
    code: string;
    sourceMap: SourceMap.RawSourceMap;
    diags: Diagnostic[];
    halted: boolean;
}

export interface TranspilerConfig {
    sourceFileName: string;
    compilerOptions?: CompilerOptions;
    visitors: Visitor[];
}

export declare function transpile(content: string, config: TranspilerConfig): TranspilerOutput;
