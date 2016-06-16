import {expect} from 'chai';
import * as ts from 'typescript';
import {MutableSourceCode} from '../src/mutable-source-code';
import {defaultCompilerOptions} from '../src/configuration';
import {FastAppendAction, FastRewriteAction, ReplaceAction, InsertAction} from '../src/mutable-source-code';


function aSourceMapperFor(source: string): MutableSourceCode {
    const ast = ts.createSourceFile('test.ts', source, defaultCompilerOptions.target, true);
    return new MutableSourceCode(ast);
}

function testMapping(mutableCode: MutableSourceCode, expectedMapping: number[]) {
    expectedMapping.forEach((sourcePosition: number, targetPosition: number) => {
        expect(mutableCode.mapToSource(targetPosition)).to.equal(sourcePosition, `Expected ${targetPosition} to be mapped to ${sourcePosition}`);
    });
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

        const expectedMapping = [
            // 0
            0,  1,  2,  3,  4,

            // 5
            5,  6,  7,  8,  9,

            // 10       //+17
            10, 11, 12, 30, 31,

            // 15
            32, 33, 34, 35, 36,

            // 20
            37, 38, 39, 40, 41,

            // 25
            42, 43
        ];
        expect(mutableCode.codeMapping).to.eql([
            { range: [0, 12],    d: 0 },
            { range: [13, 26],  d: 17 }
        ]);
        testMapping(mutableCode, expectedMapping);
    });

    it('InsertAction', function() {
        const source = `var someCode = 1;`;
        //              01234567890123456789
        //                        1
        //              var a, someCode = 1;
        const mutableCode = aSourceMapperFor(source);
        mutableCode.execute([new InsertAction(4, 'a, ')]);
        expect(mutableCode.code).to.equal(`var a, someCode = 1;`);
        expect(mutableCode.codeMapping).to.eql([
            { range: [0, 3],   d: 0 },
            { range: [4, 6],   d: null },
            { range: [7, 19],  d: -3 }
        ]);

        const expectedMapping = [
            // 0
            0,  1,  2,  3,  -1,

            // 5
           -1,  -1,  4,  5,  6,

            // 10
            7,   8,  9, 10, 11,

            // 15
            12, 13, 14, 15, 16
        ];
        testMapping(mutableCode, expectedMapping);
    });

    it('InsertAction (beginning)', function() {
        const source = `const someCode = 1;`;
        //              01234567890123456789012345
        //                        1         2
        //              var x; const someCode = 1;
        const mutableCode = aSourceMapperFor(source);
        mutableCode.execute([new InsertAction(0, 'var x; ')]);
        expect(mutableCode.code).to.equal(`var x; const someCode = 1;`);

        expect(mutableCode.codeMapping).to.eql([
            { range: [0, 6],   d: null },
            { range: [7, 25],  d: -7 }
        ]);

        const expectedMapping = [
            // 0
            -1,  -1, -1, -1, -1,

            // 5   //-7
            -1,  -1, 0,  1,  2,

            // 10
             3,  4,  5,  6,  7,

            // 15
             8,  9, 10, 11, 12,

            // 20
            13, 14, 15, 16, 17,

            // 25
            18
        ];
        testMapping(mutableCode, expectedMapping);
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

        expect(mutableCode.codeMapping).to.eql([
            { range: [0, 6],    d: 0 },
            { range: [7, 18],  d: 4 },
            { range: [19, 25], d: null },
            { range: [26, 32], d: -3 },
            { range: [33, 39], d: null },
            { range: [40, 40], d: -10 }
        ]);

        const expectedMapping = [
            // 0
             0,  1,  2,  3,  4,

            // 5     //+4
             5,  6,  11,  12,  13,

            // 10
            14, 15, 16, 17, 18,

            // 15
            19, 20, 21, 22, -1,

            // 20
            -1, -1, -1, -1, -1,

            // 25
            -1, 23, 24, 25, 26,

            // 30
            27, 28, 29, -1, -1,

            // 35
            -1, -1, -1, -1, -1,

            //40
            30
        ];
        testMapping(mutableCode, expectedMapping);

    });
});

