import * as ts from 'typescript';
import { SingleFileHost, MultipleFilesHost } from './hosts';
import { traverseAst } from './traverse-ast';
import { MutableSourceCode } from './mutable-source-code';
import { RawSourceMap } from 'source-map';
import { Visitor } from './visitor';
import { TranspilerContext } from './transpiler-context';
import { defaultCompilerOptions } from './configuration';
import { SemanticHost } from './chainable-hosts';
import { TransformationHost } from './chainable-hosts';
import { chainHosts } from './hosts-base';
import { AstCacheHost } from './chainable-hosts';

/**
 * result of transpilation action
 */
export interface TranspilerOutput {
    /**
     * the transpiled code, if transpilation was not halted
     */
    code: string,
    /**
     * a raw sourcemap object representing all changes made from the supplied source to the transpiled code (visitors and typescript alike)
     */
    sourceMap: RawSourceMap,
    /**
     * diagnostics produced by Typescript or the visitors
     */
    diags: ts.Diagnostic[],
    /**
     * did the transpilation fail
     */
    halted: boolean
}

export interface TranspilerConfig {
    sourceFileName: string;
    compilerOptions?: ts.CompilerOptions;
    visitors: Visitor[];

    /**
     * This callback allows initializing some custom user data on the source file or context
     * prior to running the visitors over the AST.
     *
     * @param ast The root AST node (the source file)
     * @param context The VisitorContext passed to each visitor when it is run
     */
    onBeforeTranspile?: (ast: ts.SourceFile, context: TranspilerContext) => void;

    /**
     * This callback allows finalizing anything stored on the source file or context
     * after running the visitors over the AST, but prior to outputting the resulting code.
     *
     * @param ast The root AST node (the source file)
     * @param context The VisitorContext passed to each visitor when it is run
     */
    onAfterTranspile?: (ast: ts.SourceFile, context: TranspilerContext) => void;
}

export interface ValidatorConfig {
    resolutionHosts?: ts.ModuleResolutionHost[];
    visitors?: Visitor[];
    mutators?: Visitor[];
}

function getParserErrors(sourceFile: ts.SourceFile): ts.Diagnostic[] {
    // We're accessing here an internal property. It would be more legit to access it through
    // ts.Program.getSyntacticDiagsnostics(), but we want to bail out ASAP.
    return sourceFile['parseDiagnostics'];
}


export function transpile(content: string | ts.SourceFile, config: TranspilerConfig): TranspilerOutput {

    // The context may contain compiler options and a list of visitors.
    // If it doesn't, we use the default as defined in ./configuration.ts

    const compilerOptions = config.compilerOptions || defaultCompilerOptions;

    // First we initialize a SourceFile object with the given source code

    const fileName: string = config.sourceFileName;

    // Then we let TypeScript parse it into an AST

    const ast = typeof content === 'string'
        ? ts.createSourceFile(fileName, content, compilerOptions.target, true)
        : content;
    const parserErrors = getParserErrors(ast);
    if (parserErrors.length > 0) {
        return {
            code: null,
            diags: parserErrors,
            halted: true,
            sourceMap: null
        }
    }

    // The context contains code modifications and diagnostics

    let context: TranspilerContext = new TranspilerContext(ast.fileName);

    // Call this before running through the list of visitors
    if (config.onBeforeTranspile) {
        config.onBeforeTranspile(ast, context);
    }

    // We execute the various visitors, each traversing the AST and generating
    // lines to be pushed into the code and diagbostic messages.
    // If one of the visitors halts the transilation process we return the halted object.

    config.visitors.some((visitor) => {
        traverseAst(ast, visitor, context);
        return context.halted;
    });

    if (context.halted) {
        return {
            code: null,
            sourceMap: null,
            diags: context.diags,
            halted: true
        };
    }

    // Call this after running through the list of visitors, but before outputting code
    if (config.onAfterTranspile) {
        config.onAfterTranspile(ast, context);
    }

    // Now, we mutate the code with the resulting list of strings to be pushed

    const mutable = new MutableSourceCode(ast);
    mutable.execute(context.actions);

    // This intermediate code has to be transpiled by TypeScript

    const compilerHost = new SingleFileHost(mutable.ast);
    const program: ts.Program = ts.createProgram([fileName], compilerOptions, compilerHost);
    const emitResult = program.emit();

    emitResult.diagnostics.forEach((d: ts.Diagnostic) => {
        context.pushDiag(mutable.translateDiagnostic(d));
    });

    // If TypeScript did not complete the transpilation, we return the halted object

    if (emitResult.emitSkipped) {
        return {
            code: null,
            sourceMap: null,
            diags: context.diags,
            halted: true
        };
    }

    // If we got here, it means we have final source code to return

    const finalCode: string = compilerHost.output;
    const intermediateSourceMap = compilerHost.sourceMap;

    // The resulting sourcemap maps the final code to the intermediate code,
    // but we want a sourcemap that maps the final code to the original code,
    // so...

    const finalSourceMap: RawSourceMap = intermediateSourceMap ? mutable.translateMap(intermediateSourceMap) : null;

    // Now we return the final code and the final sourcemap

    return {
        code: finalCode,
        sourceMap: finalSourceMap,
        diags: context.diags,
        halted: false
    };
}

export function validateAll(files: string[], config: ValidatorConfig): ts.Diagnostic[] {
    let langService: ts.LanguageService;
    const sourceHost = new MultipleFilesHost(config.resolutionHosts, defaultCompilerOptions);
    const astCache = new AstCacheHost();
    const cachedSource: ts.CompilerHost = chainHosts(sourceHost, astCache);
    const semanticHost = <SemanticHost>chainHosts(cachedSource, new SemanticHost(files, defaultCompilerOptions));

    const langServiceProvider = () => {
        return langService
            ? langService
            : langService = ts.createLanguageService(semanticHost, ts.createDocumentRegistry());
    }
    const transformHost = new TransformationHost(config.mutators || [], langServiceProvider);
    const program: ts.Program = ts.createProgram(files, defaultCompilerOptions, chainHosts(cachedSource, transformHost));
    const diags: ts.Diagnostic[] = [].concat(
        sourceHost.getSyntacticErrors(),
        program.getSemanticDiagnostics()
    );
    return diags.map(diagnostic => transformHost.translateDiagnostic(diagnostic));
}
