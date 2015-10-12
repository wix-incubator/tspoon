/// <reference path="../typings/source-map/source-map.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
import { RawSourceMap } from 'source-map';
export declare const ModuleFormats: {
    NAIVE_CJS: string;
    SYSTEM: string;
};
export declare const __esModule: boolean;
export default function transpile(source: string, context: any): {
    code: string;
    map: RawSourceMap;
};
