///<reference path="../typings/lodash/lodash.d.ts"/>
///<reference path="../typings/source-map.d.ts"/>
///<reference path="../typings/chai.d.ts"/>
/// <reference path="../node_modules/typescript/lib/typescript.d.ts" />
/// <reference path="../node_modules/typescript/lib/typescriptServices.d.ts" />

import { expect, use } from "chai";
import ts = require("typescript");

export default function use(chai, util) {

    chai.assertion.addMethod("halt", function () {
        new chai.Assertion(this._obj.isHalted).to.be.true();
    });
}
