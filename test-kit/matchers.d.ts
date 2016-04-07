/// <reference path='../typings/main.d.ts' />

declare module Chai {
    interface Assertion {
        pass(): Assertion;
        fail(): Matchers.TypeCheckFailure;
    }
}

declare module Matchers {
    interface TypeCheckFailure {
        withMessage(messageMatch: string | RegExp): TypeCheckFailure;
        withMessageCount(expectedCount: number): TypeCheckFailure;
        and: TypeCheckFailure;
    }
}
