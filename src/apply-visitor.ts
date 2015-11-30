import * as ts from "typescript";

import { defaultCompilerOptions } from './configuration';
import { traverseAst } from './traverse-ast';
import { Visitor } from "./visitor";
import { Replacement, MutableSourceCode } from './mutable-source-code';
import { TranspilerContext } from "./transpiler-context";

export interface ApplyVisitorResult {
    file: ts.SourceFile,
    code: string;
    actions: Replacement[];
    diags: ts.Diagnostic[];
}

export function applyVisitor(source: string, visitor: Visitor): ApplyVisitorResult {

    const ast = ts.createSourceFile("test.ts", source, defaultCompilerOptions.target, true);
    return applyVisitorOnAst(ast, visitor);
}

export function applyVisitorOnAst(ast: ts.SourceFile, visitor: Visitor): ApplyVisitorResult {

    let context: TranspilerContext = new TranspilerContext();

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
