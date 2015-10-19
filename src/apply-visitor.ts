import * as ts from "typescript";

import { defaultCompilerOptions } from './configuration';
import { traverseAst } from './traverse-ast';
import { Visitor } from "./visitor";
import { Insertion, MutableSourceCode } from './mutable-source-code';
import { TranspilerContext } from "./transpiler-context";

export interface ApplyVisitorResult {
    file: ts.SourceFile,
    code: string;
    insertions: Insertion[];
    diags: ts.Diagnostic[];
}

export function applyVisitor(source: string, visitor: Visitor): ApplyVisitorResult {
    const ast = ts.createSourceFile("test.ts", source, defaultCompilerOptions.target, true);
    let context: TranspilerContext = new TranspilerContext();

    traverseAst(ast, visitor, context);

	const mapper = new MutableSourceCode(ast);
	mapper.execute(context.insertions);

    return {
        code: mapper.code,
        insertions: context.insertions,
        diags: context.diags,
        file: ast.getSourceFile()
    };
}
