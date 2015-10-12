/// <reference path="../test-kit/matchers/matchers.d.ts" />

import * as chai from 'chai';
import { evaluateModuleExports, transpileAndEvaluate } from './evaluate-module';
import syntaxKindMap from "./syntax-kind-map";
import matchCode from './matchers/match-code';
import transpileTo from './matchers/transpile-to';
import { findCodePosition, findCodeRange } from './code-positions';
import passTypecheck from './matchers/pass-typecheck';
import defined from './matchers/defined';
import applyVisitor from "./apply-visitor";

chai.use(matchCode);
chai.use(transpileTo);
chai.use(passTypecheck);
chai.use(defined);

export {
    evaluateModuleExports,
    transpileAndEvaluate,
    findCodePosition,
    findCodeRange,
    syntaxKindMap,
    applyVisitor,
    passTypecheck
};
