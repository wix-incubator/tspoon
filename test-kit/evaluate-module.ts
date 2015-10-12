/// <reference path="../typings/tsd.d.ts" />

import { transpile, ModuleFormats } from '../src/index';
import core3 from './../src/decorators';
import {getModuleLoader} from './mocks/module-loaders';
import * as React from 'react';

const typorama = require('typorama');
const baseComp = require('wix-react-comp');

var defaultDependencies = [
	{depName : 'typorama', exportName : 'default', value : typorama},
	{depName : 'typorama', exportName : 'BaseType', value : typorama.BaseType},
	{depName : 'core3', exportName : 'default', value : core3},
	{depName : 'wix-react-comp', exportName : 'BaseComponent', value : baseComp.BaseComponent},
	{depName : 'react', exportName : 'default', value : React}
];


export function evaluateModuleExports(source: string, { moduleFormat = ModuleFormats.NAIVE_CJS, dependencies = [] }) {
	const moduleLoader = getModuleLoader(moduleFormat);
	dependencies.concat(defaultDependencies).forEach(({depName, exportName, value}) => {
		moduleLoader.addDependency(depName, exportName, value);
	});
	return moduleLoader.load(source);
}

export function transpileAndEvaluate(es6Source, options) {
	options = options || {};
	var transpiled = transpile(es6Source, options);
	return evaluateModuleExports(transpiled.code, options);
}
