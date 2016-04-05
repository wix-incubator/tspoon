
import * as ts from 'typescript';
import {RawSourceMap, Visitor} from "./index";

export interface HostBase extends ts.CompilerHost {}
export class HostBase implements HostBase {}


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

