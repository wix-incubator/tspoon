export interface Dependency {
    depName: string;
    exportName: string;
    value: any;
}

export interface ModuleLoader {
    addDependency(dependency: Dependency): void;
    load(source: string): Object;
}

export function getModuleLoader(): ModuleLoader {
    return new CommonJSMockLoader();
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

class CommonJSMockLoader implements ModuleLoader {
    private _dependencies = {};

    addDependency({depName, exportName, value}) {
        this._dependencies[depName] = this._dependencies[depName] || {};
        if (exportName === 'default') {
            this._dependencies[depName] = value;
        }
        this._dependencies[depName][exportName] = value;
    }

    load(source: string): Object {
        let Module = {
            exports: {}
        };
        const testFn = new Function(`
            return function loadModuleCjs(require, exports, module, __decorate, __extends) {
                ${source}
            }
        `);
        testFn()(moduleName => this._dependencies[moduleName], Module.exports, Module, __decorate, __extends);
        return Module.exports;
    }
}
