import * as ts from 'typescript';

export class MockModule implements ts.ModuleResolutionHost {

    constructor(private mockFileName: string, private mockContent: string) { }

    fileExists(fileName: string): boolean {
        return this.mockFileName === fileName;
    }

    readFile(fileName: string): string {
        return this.mockFileName === fileName ? this.mockContent : null;
    }
}
