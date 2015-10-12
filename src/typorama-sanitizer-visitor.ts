/**
 * Created by gadig on 9/20/15.
 */

/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>
/// <reference path="../typings/tsd.d.ts"/>

import { Visitor, VisitorContext } from "./visitor";
import { Node, Diagnostic, DiagnosticCategory, SyntaxKind, ClassDeclaration, NodeFlags } from 'typescript';
import * as _ from 'lodash';
import { DiagnosticMessages } from "./diagnostic-messages";

import { getIntrospectionMetadata, printIntrospection } from "./schema-collector";

export class TyporamaSanitizerVisitor implements Visitor {

    filter(node: Node): boolean {
        return (
            node.kind == SyntaxKind.ClassDeclaration &&
            node.decorators && node.decorators.some &&
            node.decorators.some((d) => d.getText() === "@core3.type")
        );
    }

    visit(node: Node, context: VisitorContext) {
        let cd = <ClassDeclaration> node;

        // No implements keyword

        if(cd.heritageClauses &&
            cd.heritageClauses.some((c) => c.token == SyntaxKind.ImplementsKeyword)) {
            context.reportDiag(node, DiagnosticCategory.Error, DiagnosticMessages.TYPORAMA_IMPLEMENTS, false);
        }

        cd.members.forEach((m) => {
            // No static members
            if(m.flags & NodeFlags.Static) {
                context.reportDiag(m, DiagnosticCategory.Error, DiagnosticMessages.TYPORAMA_STATIC, false);
            }
            // No methods
            if(m.kind == SyntaxKind.MethodDeclaration) {
                context.reportDiag(m, DiagnosticCategory.Error, DiagnosticMessages.TYPORAMA_METHODS, false);
            }
            // No accessors
            if(m.kind == SyntaxKind.GetAccessor || m.kind == SyntaxKind.SetAccessor) {
                context.reportDiag(m, DiagnosticCategory.Error, DiagnosticMessages.TYPORAMA_ACCESSORS, false);
            }
        });
    }
}
