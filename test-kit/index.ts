/// <reference path="../test-kit/matchers/matchers.d.ts" />

import * as chai from 'chai';
import syntaxKindMap from "./syntax-kind-map";
import matchCode from './matchers/match-code';
import transpileTo from './matchers/transpile-to';
import { findCodePosition, findCodeRange } from './code-positions';
import applyVisitor from "./apply-visitor";

chai.use(matchCode);
chai.use(transpileTo);

export {
    findCodePosition,
    findCodeRange,
    syntaxKindMap,
    applyVisitor,
};
