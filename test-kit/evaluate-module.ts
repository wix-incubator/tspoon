/// <reference path="../typings/tsd.d.ts" />

import {getModuleLoader, Dependency} from './mocks/module-loaders';

export {Dependency};

export function evaluateModuleExports(source: string, dependencies: Dependency[] = []) :Object{
	const moduleLoader = getModuleLoader();
	dependencies.forEach(d => {
		moduleLoader.addDependency(d);
	});
	return moduleLoader.load(source);
}
