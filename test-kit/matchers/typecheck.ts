import {expect} from 'chai';
import {printDiagnostic} from '../diagnostics-utils';
import * as ts from 'typescript';

class TypecheckFailure implements Matchers.TypeCheckFailure {
    constructor(private assertion: Chai.AssertStatic, private diags: ts.Diagnostic[]) { }

    get and(): TypecheckFailure {
        return this;
    }

    withMessage(messageMatch: string | RegExp): Matchers.TypeCheckFailure {
        let isMatch;
        if (messageMatch instanceof RegExp) {
            isMatch = this.diags.some(diag => {
                const messageText = printDiagnostic(diag);
                return !!(messageText.match(messageMatch))
            });
        } else if (typeof messageMatch === 'string') {
            isMatch = this.diags.some(diag => !!(diag.messageText && diag.messageText === messageMatch))
        }
        expect(isMatch).to.equal(true, `Expected some of the typechecker messages to match ${messageMatch}.
Actual errors:
${printErrors(this.diags)}
`)
        return this;
    }


    withMessageCount(expectedCount: number): Matchers.TypeCheckFailure {
        expect(this.diags.length)
            .to.equal(expectedCount,
            `Expected to fail with ${expectedCount} errors, but got ${this.diags.length}.
Actual errors:
${printErrors(this.diags)}
`);
        return this;
    }
}

function printErrors(diags: ts.Diagnostic[]): string {
    return diags.map<string>(printDiagnostic).join('\n');
}

export default function(chai, util) {
    chai.Assertion.addMethod('pass', function() {
        expect(this._obj).to.be.an('Array');
        this.empty;
    });

    chai.Assertion.addMethod('fail', function() {
        expect(this._obj).to.be.an('Array');
        this.not.empty;
        const diags: ts.Diagnostic[] = <ts.Diagnostic[]>this._obj;
        return new TypecheckFailure(this, diags);
    });

    chai.Assertion.addMethod('pass', function() {
        this.an('Array');
        this.assert(this._obj.length === 0,
            `Expected to get 0 validation errors, but got, but got ${this._obj.length}:
				${printErrors(this._obj)}
			`,
            'Expected to get validation errors, but got, but got none.'
        );
    });
}
