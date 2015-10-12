/// <reference path="../typings/source-map/source-map.d.ts"/>
/// <reference path="../typings/node/node.d.ts" />

import { transpile, TranspilerOutput, TranspilerConfig } from './transpile';
import { RawSourceMap } from 'source-map';

export const ModuleFormats = {
	NAIVE_CJS: 'naiveCjs',
	SYSTEM: 'system'
};

export { transpile };
