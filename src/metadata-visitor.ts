/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>
/// <reference path="../typings/tsd.d.ts"/>
/**
 * Created by gadig on 9/20/15.
 */

import { Visitor, VisitorContext } from "./visitor";
import { Node, Diagnostic, Decorator, ClassDeclaration, SyntaxKind } from 'typescript';
import * as _ from 'lodash';

import { getIntrospectionMetadata, printIntrospection } from "./schema-collector";

function isMetadataDecorator(d: Decorator): boolean {
    return d.getText().slice(0, 6) === "@core3";
}

export class MetadataVisitor implements Visitor {

    filter(node: Node): boolean {
        return (
            node.kind == SyntaxKind.ClassDeclaration &&
            node.decorators && node.decorators.some &&
            node.decorators.some((d) => isMetadataDecorator(d))
        );
    }

    visit(node: Node, context: VisitorContext) {
		let targetPosition: number = node.pos;
		const classNode: ClassDeclaration = <ClassDeclaration> node;
		if(!_.isEmpty(classNode.decorators)) {
			targetPosition = (<Decorator>_.last(classNode.decorators)).end + 1;
		}
        const metadata = getIntrospectionMetadata(node);
        const metadataString = printIntrospection(metadata, false);
        context.insertLine(targetPosition, `@core3.metadata(${metadataString})`);
    }
}
