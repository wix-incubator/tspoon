import {RawSourceMap} from "../index";
export interface RemappingPoint {
    // From this position on (until the next RemappingPoint)...
    position: number;

    // ...correct any position by this offset
    offset: number;
}

export function correctPosition(position: number, mapping: RemappingPoint[]): number {
    return position;
}

export function correctSourceMap(sourceMap: RawSourceMap, mapping: RemappingPoint[]): RawSourceMap {
    return sourceMap;
}
