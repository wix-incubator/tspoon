import {expect} from 'chai';
import * as ts from 'typescript';
import {MutableSourceCode} from '../src/mutable-source-code';
import {defaultCompilerOptions} from '../src/configuration';
import {FastAppendAction, FastRewriteAction, ReplaceAction, InsertAction} from '../src/mutable-source-code';


function aSourceMapperFor(source: string): MutableSourceCode {
    const ast = ts.createSourceFile('test.ts', source, defaultCompilerOptions.target, true);
    return new MutableSourceCode(ast);
}

describe('Mutable source actions performs', function() {
    it('FastAppendAction at the end of source', () => {
        const source = `const someCode = 'Some string';`;
        const mutableCode = aSourceMapperFor(source);
        mutableCode.execute([new FastAppendAction('const b = 666;')]);
        expect(mutableCode.code).to.equal(`const someCode = 'Some string';const b = 666;`);
        expect(mutableCode.codeMapping).to.eql([]);
    });

    it('FastRewriteAction', function() {
        const source = `const someCode = 'Some string';`;
        //              0123456789012345678901234567890
        //                        1         2         3
        const mutableCode = aSourceMapperFor(source);
        mutableCode.execute([new FastRewriteAction(18, 'XXXXXXXXXXX')]);
        expect(mutableCode.code).to.equal(`const someCode = 'XXXXXXXXXXX';`);
        expect(mutableCode.codeMapping).to.eql([]);
    });

    it('ReplaceAction - replace style', function() {
        const source = `const someCode = 'Some string'; const x = 1;`;
        //              01234567890123456789012345678901234567890123
        //                        1         2         3         4
        //              const b = 666; const x = 1;
        const mutableCode = aSourceMapperFor(source);
        mutableCode.execute([new ReplaceAction(6, 30, 'b = 666')]);
        expect(mutableCode.code).to.equal('const b = 666; const x = 1;');
        expect(mutableCode.codeMapping).to.eql([
            { source: [0, 5], target: [0, 5] },
            { source: [6, 30], target: [6, 13] },
            { source: [31, 43], target: [14, 26] },
        ]);
    });

    it('InsertAction', function() {
        const source = `var someCode = 'Some string';`;
        //              012345678901234567890123456789012
        //                        1         2         3
        //              var a, someCode = 'Some string';
        const mutableCode = aSourceMapperFor(source);
        mutableCode.execute([new InsertAction(4, 'a, ')]);
        expect(mutableCode.code).to.equal(`var a, someCode = 'Some string';`);
        expect(mutableCode.codeMapping).to.eql([
            { source: [0,3], target: [0,3] },
            { source: [4,28], target: [7,31] },
        ]);
    });

    it('InsertAction (beginning)', function() {
        const source = `const someCode = 'Some string';`;
        //              01234567890123456789012345678901234567890
        //                        1         2         3
        //              var x; const someCode = 'Some string';
        const mutableCode = aSourceMapperFor(source);
        mutableCode.execute([new InsertAction(0, 'var x; ')]);
        expect(mutableCode.code).to.equal(`var x; const someCode = 'Some string';`);
        expect(mutableCode.codeMapping).to.eql([
            { source: [0,30], target: [7,37] },
        ]);
    });

    it('several actions in sequence', function() {
        const source = `const someCode = 'Some string';`;
        //              01234567890123456789012345678901234567890123456
        //                        1         2         3         4
        //              const __someCode = 'XXXXXXXXXXX';const b = 666;
        const mutableCode = aSourceMapperFor(source);
        mutableCode.execute([
            new ReplaceAction(6, 6, '__'),
            new FastAppendAction('const b = 666;'),
            new FastRewriteAction(18, 'XXXXXXXXXXX')
        ]);
        expect(mutableCode.code).to.equal(`const __someCode = 'XXXXXXXXXXX';const b = 666;`);
    });

    it('composes several remapping actions', function () {
        const source = `const someCode = 'Some string';`;
        //              01234567890123456789012345678901234567890123456
        //                        1         2         3         4
        //              const code = 'Some bloody string' + "s.";
        const mutableCode = aSourceMapperFor(source);
        mutableCode.execute([
            new InsertAction(23, 'bloody '),
            new ReplaceAction(6, 11, 'c'),
            new InsertAction(30, ' + "s."')
        ]);
        expect(mutableCode.code).to.equal(`const code = 'Some bloody string' + "s.";`);
        expect(mutableCode.mapToSource(4)).to.equal(4);
        expect(mutableCode.mapToSource(8)).to.equal(8);
        expect(mutableCode.mapToSource(11)).to.equal(15);
        expect(mutableCode.mapToSource(26)).to.equal(23);
        expect(mutableCode.mapToSource(38)).to.equal(-1);
    });
});
