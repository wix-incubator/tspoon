import * as ts from 'typescript';

interface StartOfSourceMap {
    file?: string;
    sourceRoot?: string;
}

interface RawSourceMap extends StartOfSourceMap {
    version: string;
    sources: Array<string>;
    names: Array<string>;
    sourcesContent?: string[];
    mappings: string;
}

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
    insert(position: number, str: string): void;
    replace(start: number, end: number, str: string): void;
    fastAppend(str: string): void;
    fastRewrite(start: number, str: string): void;
    reportDiag(node: ts.Node, category: ts.DiagnosticCategory, message: string, halt?: boolean): void;
    getLanguageService(): ts.LanguageService;
}

export interface Visitor {
    filter(node: ts.Node): boolean;
    visit(node: ts.Node, context: VisitorContext, traverse: (...visitors: Visitor[]) => void): void;
}

export function transpile(content: string, config: TranspilerConfig): TranspilerOutput;

export interface ApplyVisitorResult {
    file: ts.SourceFile,
    code: string;
    diags: ts.Diagnostic[];
}

export function applyVisitor(source: string, visitor: Visitor): ApplyVisitorResult;

export function applyVisitorOnHostedSource(file: string, visitors: Visitor[], host: ts.CompilerHost): string;

export function applyVisitorOnAst(ast: ts.SourceFile, visitor: Visitor): ApplyVisitorResult;

export interface ValidatorConfig {
    resolutionHosts?: ts.ModuleResolutionHost[];
    visitors?: Visitor[];
    mutators?: Visitor[];
}

export function validateAll(files: string[], config: ValidatorConfig): ts.Diagnostic[];

export function traverseAst(root: ts.Node, visitor: Visitor, context: VisitorContext): boolean;

export interface HostBase extends ts.CompilerHost { }
export class HostBase implements HostBase { }

export class ChainableHost extends HostBase {
    setSource(source: ts.CompilerHost): void;
}

export function chainHosts(host0: ts.CompilerHost, ...chainableHosts: ChainableHost[]): ts.CompilerHost;

export class AstCacheHost extends ChainableHost {
    getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile;
}

export class TransformationHost extends ChainableHost {
    constructor(visitors: Visitor[], languageServiceProvider?: () => ts.LanguageService);
    getSourceMap(fileName: string): RawSourceMap;
    translateDiagnostic(diagnostic: ts.Diagnostic): ts.Diagnostic;
}

export interface SemanticHost extends ts.LanguageServiceHost, ts.CompilerHost, ts.DocumentRegistry {
    getCancellationToken(): ts.CancellationToken;
    getNewLine(): string;
    useCaseSensitiveFileNames();
}
export class SemanticHost extends ChainableHost {
    constructor(files: string[], compilerOptions?: ts.CompilerOptions);
}

export class MultipleFilesHost extends HostBase {
    constructor(resolutionHosts: ts.ModuleResolutionHost[], compilerOptions?: ts.CompilerOptions)
    getSyntacticErrors(): ts.Diagnostic[];
}

export class SingleFileHost extends HostBase {
    constructor(ast: ts.SourceFile);
    public output: string;
    public sourceMap: RawSourceMap;
}
