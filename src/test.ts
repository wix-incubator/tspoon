const actual = [
    { range: [ 0, 6 ], d: 0 },
    { range: [ 0, 22 ], d: 0 },
    { range: [ 0, 29 ], d: 0 },
    { range: [ 7, 40 ], d: 4 },
    { range: [ 23, 29 ], d: null },
    { range: [ 30, 36 ], d: null },
    { range: [ 30, 44 ], d: -7 },
    { range: [ 37, 37 ], d: -7 }
];

const inverted = [
    // { range: [ 7, 40 ], d: 4 },
    
    { range: [0, 11], d}
];






console.log(mutableCode.codeMapping)
expect(mutableCode.codeMapping).to.eql([
    { range: [0, 6],    d: 0 },
    { range: [7, 18], d: 4 },
    { range: [19, 25], d: null },
    { range: [26, 32], d: -3 },
    { range: [33, 39], d: null },
    { range: [40, 40], d: -10 }
]);
