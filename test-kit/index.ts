/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />
///<reference path="../node_modules/typescript/lib/typescriptServices.d.ts"/>
import * as ts from 'typescript';

export function tsToAst(code: string): ts.Node {
    return ts.createSourceFile("test.ts", code, ts.ScriptTarget.ES5, true);
}
