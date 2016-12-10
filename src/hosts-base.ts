import * as ts from 'typescript';

export class HostBase implements ts.CompilerHost {

    // Most likely to be overridded

    fileExists(fileName: string): boolean {
        return false;
    }

    directoryExists(directoryName: string): boolean {
        return false;
    }

    readFile(fileName: string): string {
        return null;
    }

    getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile {
        return null;
    }

    writeFile(name: string, text: string, writeByteOrderMark: boolean) {
    }

    useCaseSensitiveFileNames() {
        return false;
    }

    getCanonicalFileName(fileName: string) {
        return fileName;
    }

    getCurrentDirectory(): string {
        return '';
    }

    getNewLine(): string {
        return '\n';
    }

    getDefaultLibFileName(options: ts.CompilerOptions): string {
        return 'lib.d.ts';
    }

    getCancellationToken(): ts.CancellationToken {
        return null;
    }

    getDirectories(path: string): string[] {
        return [];
    }
}


export class ChainableHost extends HostBase {
    protected source: ts.CompilerHost = null;

    setSource(source: ts.CompilerHost): void {
        if (this.source === null) {
            this.source = source;
        } else {
            throw new Error(`A chainable host can be connected to a source only once. It looks like you're trying to include the same instance in multiple chains.`);
        }
    }

    fileExists(fileName: string): boolean {
        return this.source.fileExists(fileName);
    }

    directoryExists(directoryName: string): boolean {
        return this.source.directoryExists(directoryName);
    }

    getCurrentDirectory(): string {
        return this.source.getCurrentDirectory();
    }

    readFile(fileName: string): string {
        return this.source.readFile(fileName);
    }

    getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile {
        return this.source.getSourceFile(fileName, languageVersion, onError);
    }

    writeFile(name: string, text: string, writeByteOrderMark: boolean) {
        this.source.writeFile(name, text, writeByteOrderMark);
    }

    getDirectories(path: string): string[] {
        return this.source.getDirectories(path);
    }
}

export function chainHosts(host0: ts.CompilerHost, ...chainableHosts: ChainableHost[]): ts.CompilerHost {
    return chainableHosts.reduce((acc: ts.CompilerHost, chainableHost: ChainableHost) => {
        chainableHost.setSource(acc);
        return chainableHost;
    }, host0 as ChainableHost);
}

