/**
 * Created by gadig on 9/21/15.
 */

/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>

import * as ts from 'typescript';
import { defaultCompilerOptions } from '../src/configuration';
import { traverseAst } from '../src/traverse-ast';
import { Visitor } from "../src/visitor";
import { Insertion, MutableSourceCode } from '../src/mutable-source-code';
import { TranspilerContext } from "../src/transpiler-context";

export interface ApplyVisitorResult {
    file: ts.SourceFile,
    code: string;
    insertions: Insertion[];
    diags: ts.Diagnostic[];
}

export default function applyVisitor(source: string, visitor: Visitor): ApplyVisitorResult {
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
