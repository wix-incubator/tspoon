import * as ts from 'typescript';
import {Visitor} from './src';
import {RawSourceMap} from 'source-map';

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

export class SemanticHost extends ChainableHost implements ts.LanguageServiceHost, ts.CompilerHost {
    private files;
    private compilerOptions;
    private libDir;
    constructor(files: string[], compilerOptions?: ts.CompilerOptions, libDir?: string);
    getProjectVersion(): string;
    getScriptFileNames(): string[];
    getScriptVersion(fileName: string): string;
    getScriptSnapshot(fileName: string): ts.IScriptSnapshot;
    getLocalizedDiagnosticMessages(): any;
    getCompilationSettings(): ts.CompilerOptions;
    log(s: string): void;
    trace(s: string): void;
    error(s: string): void;
    resolveModuleNames(moduleNames: string[], containingFile: string): ts.ResolvedModule[];
    directoryExists(directoryName: string): boolean;
    acquireDocument(fileName: string, compilationSettings: ts.CompilerOptions, scriptSnapshot: ts.IScriptSnapshot, version: string): ts.SourceFile;
    updateDocument(fileName: string, compilationSettings: ts.CompilerOptions, scriptSnapshot: ts.IScriptSnapshot, version: string): ts.SourceFile;
    releaseDocument(fileName: string, compilationSettings: ts.CompilerOptions): void;
    reportStats(): string;
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
