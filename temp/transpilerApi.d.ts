/// <reference path="../typings/source-map/source-map.d.ts" />
import { RawSourceMap } from 'source-map';
export declare function transpile(content: string, context: any): {
    code: string;
    map: RawSourceMap;
};
