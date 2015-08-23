/// <reference path="../typings/chai.d.ts" />
/// <reference path="../typings/mocha.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescriptServices.d.ts" />

import ts from 'typescript';
import { expect, use } from 'chai';
import {Visitor, TSpoon} from '../src/Visitor';


/*
 case 1 : simple e2e transpilation
 given a TS program with source files
 given visitors of annotation types

 the visitors visit all and only the class definitions that are relevent for them

 the visitors can insert changes to the target class
 the visitors can define diagnostic output
 the visitors can define failure to process

 ask for the emit of each file and get:
 code
 source-maps
 diagnostic
 error code


 case 2: ongoing changes
 as above

 given changes to input program's source
 ask for the emit of each file and get:
 code
 source-maps
 diagnostic
 error code
 */


describe("e2e test", ()=> {
	let program : ts.Program;
	let visitors : Array<Visitor>;

	before('works', () => {
		// todo: make program instance
		// todo : make visitors array
		var tspoon = new TSpoon(program, visitors);
	});
});
