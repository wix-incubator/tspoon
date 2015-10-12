import { Node, Diagnostic } from 'typescript';
import { Visitor } from './visitor';
export declare class LinePush {
    position: number;
    line: string;
    constructor(node: Node, line: string);
}
export declare class Diagnose {
    position: number;
    line: Diagnostic;
    constructor(node: Node, line: Diagnostic);
}
export declare function traverseAst(root: Node, visitor: Visitor, linePushList?: LinePush[], diagList?: Diagnose[]): boolean;
