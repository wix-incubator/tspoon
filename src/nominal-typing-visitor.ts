/**
 * Created by gadig on 10/07/15.
 */

/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>
/// <reference path="../typings/tsd.d.ts"/>

import { Visitor, VisitorContext } from "./visitor";
import { Node, Diagnostic, SyntaxKind, ClassDeclaration } from 'typescript';
import * as _ from 'lodash';
import { DiagnosticMessages } from "./diagnostic-messages";

import { getIntrospectionMetadata, printIntrospection } from "./schema-collector";

export class NominalTypingVisitor implements Visitor {

    filter(node: Node): boolean {
        return (
            node.kind == SyntaxKind.ClassDeclaration &&
            node.decorators && node.decorators.some &&
            node.decorators.some((d) => d.getText() === "@core3.type")
        );
    }

    visit(node: Node, context: VisitorContext) {
        const classNode: ClassDeclaration = <ClassDeclaration> node;
        if(classNode.members == null || classNode.members.length == 0) {
            return;
        }
        let targetPosition: number = classNode.members[0].pos;
        const memberName = "__type_" + classNode.name.text + "__";
        context.insertLine(targetPosition, `${memberName};`);
    }
}
