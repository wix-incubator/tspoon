import { expect } from 'chai';
import * as tspoon from '../../src';
import { evaluateModuleExports } from '../../test-kit';
import { readFileSync } from 'fs';
import * as path from 'path';
let visitor = require('../../../examples/poc/deletePrivate.js');

describe('poc example', function () {
    let sourceCode, configNoVisitors, configWithVisitors;
    before(() => {
        sourceCode = readFileSync(path.resolve(__dirname, '../../../examples/poc/src.ts'), 'utf8'); // the path is relative to tspoon/dist/test
        configNoVisitors = {
            sourceFileName: 'src.ts',
            visitors: []
        };
        configWithVisitors = {
            sourceFileName: 'src.ts',
            visitors: [visitor]
        };
    });

    it('is transpiled', function () {
        let transpilerOut = tspoon.transpile(sourceCode, configWithVisitors);
        expect(transpilerOut.halted).not.to.be.ok;
        expect(transpilerOut.code).to.be.ok;
        expect(transpilerOut.sourceMap).to.be.ok;
    });

    it('is transpiled correctly without visitors', function () {
        let transpilerOut = tspoon.transpile(sourceCode, configNoVisitors);
        let TwoNames = evaluateModuleExports(transpilerOut.code)['TwoNames'];
        let instance = new TwoNames();
        expect(transpilerOut.diags).to.be.empty;
        expect(transpilerOut.halted).not.to.be.ok;
        expect(instance.publicName, 'publicName').to.eql('Doe');
        expect(instance.privateName, 'privateName').to.eql('John');
    });

    it('is transpiled correctly with visitors and removes fields with no explicit visibility', function () {
        let transpilerOut = tspoon.transpile(sourceCode, configWithVisitors);
        let TwoNames = evaluateModuleExports(transpilerOut.code)['TwoNames'];
        let instance = new TwoNames();
        expect(instance.publicName, 'publicName').to.eql('Doe');
        expect(instance.privateName, 'privateName').not.to.be.ok;
    });
});
