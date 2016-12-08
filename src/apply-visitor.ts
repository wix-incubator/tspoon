import * as ts from 'typescript';
import {defaultCompilerOptions} from './configuration';
import {traverseAst} from './traverse-ast';
import {Visitor} from './visitor';
import {Action, MutableSourceCode} from './mutable-source-code';
import {TranspilerContext} from './transpiler-context';
import {SemanticHost} from './chainable-hosts';
import {VisitorBasedTransformer, CodeTransformer} from './transformer';

export interface ApplyVisitorResult {
    file: ts.SourceFile,
    code: string;
    actions: Action[];
    diags: ts.Diagnostic[];
}

export function applyVisitor(source:string, visitor:Visitor):ApplyVisitorResult {

    const ast = ts.createSourceFile('test.ts', source, defaultCompilerOptions.target, true);
    return applyVisitorOnAst(ast, visitor);
}

export function applyVisitorOnHostedSource(file:string, visitors:Visitor[], host:ts.CompilerHost):string {
    // TODO: TS1/2 compat, remove after TS2 upgrade
    const docReg: ts.DocumentRegistry =  ts.createDocumentRegistry ? ts.createDocumentRegistry() : host as any;

    const langService = host instanceof SemanticHost ? ts.createLanguageService(host, docReg) : null;
    const transformer:CodeTransformer = new VisitorBasedTransformer(visitors, () => langService);
    const ast:ts.SourceFile = host.getSourceFile(file, defaultCompilerOptions.target);
    if (ast) {
        const mutableSourceCode:MutableSourceCode = transformer.transform(ast);
        return mutableSourceCode.code;
    } else {
        return null;
    }
}

export function applyVisitorOnAst(ast:ts.SourceFile, visitor:Visitor):ApplyVisitorResult {

    let context:TranspilerContext = new TranspilerContext(ast.fileName);

    traverseAst(ast, visitor, context);

    const mapper = new MutableSourceCode(ast);
    mapper.execute(context.actions);

    return {
        code: mapper.code,
        actions: context.actions,
        diags: context.diags,
        file: ast.getSourceFile()
    };
}



