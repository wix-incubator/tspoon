/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>

import * as ts from "typescript";

export function replaceNode(sourceFile:ts.SourceFile, node:ts.Node, code:string):ts.SourceFile {
    const oldText = sourceFile.text;
    const newText = oldText.slice(0, node.pos) + code + oldText.slice(node.end);
    const textSpan:ts.TextSpan = ts.createTextSpanFromBounds(node.pos, node.end);
    const textChangeRange:ts.TextChangeRange = ts.createTextChangeRange(textSpan, code.length);
    return sourceFile.update(newText, textChangeRange);
}

export interface Visitor { (sourceFile:ts.SourceFile, node:ts.Node) : string }

export function transformAst(sourceFile:ts.SourceFile, visitor:Visitor):ts.SourceFile {
    let changeList = [];

    function transform(node:ts.Node) {
        const visitorResult:string = visitor.call(null, sourceFile, node);
        if(visitorResult !== null) {
            changeList.push({ node, newText:visitorResult })
        }
        ts.forEachChild(node, transform);
    }

    transform(sourceFile);

    changeList.reverse().forEach(item => {
        sourceFile = replaceNode(sourceFile, item.node, item.newText);
    });
    return sourceFile;

}
