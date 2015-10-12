/// <reference path="../../typings/tsd.d.ts" />

import {ModuleFormats} from '../../src/index';

export interface ModuleLoader {
	addDependency(dependencyName:string, exportName:string, value:any): void;
	load(source:string):Object;
}

export function getModuleLoader(moduleFormat): ModuleLoader {
	if(moduleFormat === ModuleFormats.NAIVE_CJS) {
		return new CommonJSMockLoader();
	} else if(moduleFormat === ModuleFormats.SYSTEM) {
		throw new Error(`${moduleFormat} not yet supported.`);
	} else throw new Error(`unknown module format ${moduleFormat}`);
}


// typescript-generated functions

function __decorate(decorators, target, key, desc) {
	switch (arguments.length) {
		case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
		case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
		case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
	}
}

function __extends(d, b) {
	for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	function __() { this.constructor = d; }
	d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

// ... end of ts generated stuff

class CommonJSMockLoader implements ModuleLoader{
	private _dependencies = {};

	addDependency(depName:string, exportName:string, value:any) {
		this._dependencies[depName] = this._dependencies[depName] || {};
		if(exportName === 'default') {
			this._dependencies[depName] = value;
		} else {
			this._dependencies[depName][exportName] = value;
		}
	}

	load(source:string):Object {
		let Module = {
			exports: {}
		};
		var testFn = new Function(`
            return function loadModuleCjs(require, exports, module, __decorate, __extends) {
                ${source}
            }
        `);
		testFn()(moduleName => this._dependencies[moduleName], Module.exports, Module, __decorate, __extends);
		return Module.exports;
	}
}
