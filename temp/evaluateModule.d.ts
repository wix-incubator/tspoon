/// <reference path="../typings/tsd.d.ts" />
export declare function evaluateModuleExports(source: string, {moduleFormat, dependencies}: {
    moduleFormat?: string;
    dependencies?: any[];
}): any;
export declare function transpileAndEvaluate(es6Source: any, options: any): any;
