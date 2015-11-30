///<reference path="matchers.d.ts"/>

import { findCodePosition, findCodeRange } from './code-positions';
import typecheck from './matchers/typecheck';
import * as chai from 'chai';

chai.use(typecheck);

export {
    findCodePosition,
    findCodeRange
};
