/// <reference path="../typings/chai.d.ts" />
/// <reference path="../typings/mocha.d.ts" />
/// <reference path="../test-kit/matchers.d.ts" />

import { expect, use } from 'chai';
import matchers from "../test-kit/matchers";

chai.use(matchers);

describe("failed", function() {
    it("checks if ", function() {
        var obj = {
          isFailed: true
        };
        expect(obj).to.have.failed();
    });
});
