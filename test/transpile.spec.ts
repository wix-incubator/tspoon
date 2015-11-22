///<reference path="../typings/tsd.d.ts"/>

import {expect} from 'chai';
import {transpile, TranspilerConfig} from '../src';

const config: TranspilerConfig = {
	sourceFileName: 'sample.tsx',
	visitors: []
};

describe('transpiler', function () {
	it('fails on parser errors', function () {
		const source = 'let a = <div><div></div>;';
		const transpiled = transpile(source, config);
		expect(transpiled.code).to.equal(null);
		expect(transpiled.diags).not.to.be.empty;
	});
});
