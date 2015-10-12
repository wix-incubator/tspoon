/// <reference path="../typings/lodash/lodash.d.ts" />
export interface IdentifierMetadata {
    name: string;
    type: string;
}
export interface MemberMetadata extends IdentifierMetadata {
    kind: string;
    visibility?: string;
    params?: IdentifierMetadata[];
}
export interface ClassMetadata {
    name: string;
    tags: string[];
    members: MemberMetadata[];
}
export declare function getIntrospectionMetadata(node: any): ClassMetadata;
export declare function printIntrospectionHelper(metaData: any): string;
