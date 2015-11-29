import {expect} from 'chai';
import * as tspoon from '../src/index';
import * as ts from 'typescript';


describe.only('tspoon.validate()', function () {
	it("lets valid code pass", function () {
		const source = 'const perfectlyValid: number = 666;';
		const ast:ts.SourceFile = tspoon.parse('sample.tsx', source);
		expect(tspoon.validate(ast, {})).to.pass();
	});

	it("makes invalid code fail", function () {
		const source = `
			// This comment here
			// is just
			// to add some lines
			const perfectlyValid: number = 666;
			const perfectlyInvalid: SomeWeirdType = "HAHAHA";
		`;
		const ast:ts.SourceFile = tspoon.parse('sample.tsx', source);
		expect(tspoon.validate(ast, {})).to.fail()
			.withMessageCount(1)
			.withMessage(/.* -> 5:\d+ Cannot find name 'SomeWeirdType'./);
	});

	it("lets pass invalid code (modified by a visitor to a valid code)", function () {
		const source = `
			// This comment here
			// is just
			// to add some lines
			const perfectlyValid: number = 666;
			const perfectlyInvalid: SomeWeirdType = "HAHAHA";
		`;

		const ast: ts.SourceFile = tspoon.parse('sample.tsx', source);
		expect(tspoon.validate(ast, {})).to.pass();
	});

	it("makes invalid code (modified by a visitor to a still invalid code) fail", function () {
		const source = `
			// This comment here
			// is just
			// to add some lines
			const perfectlyValid: number = 666;
			const perfectlyInvalid: SomeWeirdType = "HAHAHA";
		`;

		const ast: ts.SourceFile = tspoon.parse('sample.tsx', source);
		expect(tspoon.validate(ast, {})).to.fail()
			.withMessageCount(1)
			.withMessage(/.* -> 5:\d+ Cannot find name 'StillWeirdType'./);
	})

});
