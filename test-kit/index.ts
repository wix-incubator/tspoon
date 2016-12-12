import * as chai from 'chai';
import typecheck from './matchers/typecheck';

chai.use(typecheck);

export {findCodePosition, findCodeRange} from './code-positions';
export {evaluateModuleExports} from './evaluate-module';
