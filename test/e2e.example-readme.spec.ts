import {expect} from 'chai';
import * as tspoon from '../src/index';
import {evaluateModuleExports} from '../test-kit/index';
let visitor = require('../../examples/readme/alertProperty.js');

describe('readme example', function() {
    let sourceCode, config;
    before(() => {
        sourceCode = require('../../examples/readme/src.ts'); // the path is relative to tspoon/dist/test
        config = {
            sourceFileName: 'src.ts',
            visitors: [visitor]
        };
    });

    it('is transpiled', function() {
        let transpilerOut = tspoon.transpile(sourceCode, config);
        expect(transpilerOut.halted).not.to.be.ok;
        expect(transpilerOut.code).to.be.ok;
        expect(transpilerOut.sourceMap).to.be.ok;
    });

    it('is transpiled correctly with visitors', function() {
        let transpilerOut = tspoon.transpile(sourceCode, config);
        let TwoNames = evaluateModuleExports(transpilerOut.code)['TwoNames'];
        let instance = new TwoNames();
        expect(transpilerOut.halted).not.to.be.ok;
        expect(instance.publicName, 'publicName').to.eql('Doe');
        expect(instance.privateName, 'privateName').to.eql('John');
    });

    it('is transpiled with two diagnostics', function() {
        expect(tspoon.transpile(sourceCode, config).diags.length).to.eql(2);
    });
});
