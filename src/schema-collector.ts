/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>
/// <reference path="../typings/lodash/lodash.d.ts"/>

import * as ts from 'typescript';
import * as _ from 'lodash';

export interface ParamMetadata {
    name: string;
    type: string;
    optional: boolean;
}

export interface MemberMetadata {
    name: string;
    type: string;
	isStatic?: boolean;
}

export interface MethodMetadata extends MemberMetadata {
    params?: ParamMetadata[];
}

export interface ClassMetadata {
	name: string;
	extends?: string;
	tags: string[];
	properties: MemberMetadata[];
    methods: MethodMetadata[];
}

export function getIntrospectionMetadata(node: ts.Node): ClassMetadata {

    function getTypeAnnotation(type: { kind: ts.SyntaxKind, getText: () => string } ): string {
        if(type && type.kind == ts.SyntaxKind.FunctionType)
            return "Function";
        return type ? type.getText().trim() : null;
    }

    function getParamMetadata(node: ts.ParameterDeclaration): ParamMetadata {
        return {
            name: node.name.getText(),
            type: getTypeAnnotation(node.type),
            optional: node.questionToken != null
        };
    }

    function getMethodMetadata(node: ts.MethodDeclaration): MethodMetadata {
        let item:MethodMetadata = {
            name: node.name.getText().trim(),
            params: node.parameters.map(getParamMetadata),
            type: getTypeAnnotation(node.type)
        };
		if(hasModifier(node, ts.SyntaxKind.StaticKeyword)) {
			item.isStatic = true;
		}
		return item;
    }

    function getPropertyMetadata(node: ts.PropertyDeclaration): MemberMetadata {
		let item:MemberMetadata = {
            name: node.name.getText().trim(),
            type: getTypeAnnotation(node.type)
        };
		if(hasModifier(node, ts.SyntaxKind.StaticKeyword)) {
			item.isStatic = true;
		}
		return item;
    }

	function getExtendedClass(node: ts.ClassDeclaration): string {
		const extendClass = node.heritageClauses && _.find(node.heritageClauses, node => node.token === ts.SyntaxKind.ExtendsKeyword);
		return extendClass ? extendClass.types[0].getText() : undefined;
	}

	function hasModifier(node: ts.ClassElement, syntaxKind:ts.SyntaxKind):boolean {
		return _.some(node.modifiers, modifier => modifier.kind === syntaxKind);
	}

    function getClassMetadata(node: ts.ClassDeclaration): ClassMetadata {
		const members:ts.ClassElement[] = node.members.filter(member => !hasModifier(member, ts.SyntaxKind.PrivateKeyword));
        let classMetadata = {
            name: node.name.text,
            tags: <string[]> (node.decorators ? node.decorators.map(item => item.getText()) : []),
            properties: <MemberMetadata[]> members.filter(
                n => n.kind === ts.SyntaxKind.PropertyDeclaration
            ).map(getPropertyMetadata),
            methods: <MethodMetadata[]> members.filter(
                n => n.kind === ts.SyntaxKind.MethodDeclaration
            ).map(getMethodMetadata)
        };
		const extendedClass = getExtendedClass(node);
		if(extendedClass) {
			classMetadata['extends'] = extendedClass;
		}
		return classMetadata;
    }

	if (node.kind !== ts.SyntaxKind.ClassDeclaration) {
		throw new TypeError(`Invalid node kind ${node.kind} for node ${node.getText().trim()}`);
	}
    return getClassMetadata(<ts.ClassDeclaration> node);
}

function toLineArray(lines: string[], entity: any) {

    function addArray(key: string) {
        lines.push("'" + key.trim() + "': [");
        entity[key].forEach((ta) => toLineArray(lines, ta));
        lines.push("]");
    }

    lines.push("{");
    entity.name && lines.push("'name': " + JSON.stringify(entity.name.trim()));
    entity.tags && lines.push("'tags': " + JSON.stringify(entity.tags));
    entity.extends && lines.push("'extends': " + entity['extends']);
    const typoramaTypes =
        { 'string': 'typorama.String', 'boolean': 'typorama.Boolean', 'number': 'typorama.Number',
        'Array': 'typorama.Array', 'Function': 'typorama.Function' };
    entity.type && lines.push("'type': " +
        ( typoramaTypes[entity.type] ? typoramaTypes[entity.type] : entity.type ));
    entity.optional && lines.push("'optional': " + entity.optional);
    entity.params && addArray("params");
	entity.isStatic && lines.push("'isStatic': true");
    entity.properties && addArray("properties");
    entity.methods && addArray("methods");
    lines.push("}");
}

function addCommas(array: string[]): string[] {
    return array.map((s, index) => {
        s = s.trim();
        var next = index+1 >= array.length ? null : array[index+1];
        const lastChar = s.charAt(s.length-1);
        return lastChar != "{" && lastChar != "[" && next != null && next != "}" && next != "]" ?
            s += "," : s;
    });
}

function indent(array: string[]): string[] {
    var tabs = "";
    return array.map((s, index) => {
        const lastChar = s.charAt(s.length-1);
        if(lastChar == "{" || lastChar == "[") {
            s = tabs + s;
            tabs += "\t";
        } else if(s == "}" || s == "]" || s == "}," || s == "],") {
            tabs = tabs.substring(1);
            s = tabs + s;
        } else {
            s = tabs + s;
        }
        return s;
    });
}

export function printIntrospection(entity: ClassMetadata, pretty: boolean = false): string {
    var lines: string[] = [];
    toLineArray(lines, entity);
    lines = addCommas(lines);
    pretty && (lines = indent(lines));
    return lines.reduce((prev, s) => prev + s + "\n", "");
}
