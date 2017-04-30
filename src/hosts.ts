import * as ts from 'typescript';
import { HostBase } from './hosts-base';
import { defaultCompilerOptions } from './configuration';
import { RawSourceMap } from 'source-map';

function fileExtensionIs(path: string, extension: string): boolean {
    let pathLen = path.length;
    let extLen = extension.length;
    return pathLen > extLen && path.substr(pathLen - extLen, extLen) === extension;
}

export class MultipleFilesHost extends HostBase implements ts.CompilerHost {

    private syntacticErrors: ts.Diagnostic[] = [];

    constructor(private _resolutionHosts: ts.ModuleResolutionHost[],
        private _compilerOptions: ts.CompilerOptions = defaultCompilerOptions) {
        super();
    }

    getCurrentDirectory(): string {
        let currentDir = '';
        this._resolutionHosts.forEach((host) => {
            if (host.getCurrentDirectory) {
                const hostCurrentDir = host.getCurrentDirectory();
                if (hostCurrentDir) {
                    currentDir = hostCurrentDir;
                }
            }
        });
        return currentDir;
    }

    directoryExists(directoryName: string): boolean{
        if (directoryName === '') {
            return true;
        }
        return this._resolutionHosts.some(host => host.directoryExists && host.directoryExists(directoryName));
    }

    getDirectories(path: string): string[] {
        return this._resolutionHosts.reduce((directories, host)=>{
            return host.getDirectories ? directories.concat(host.getDirectories(path)) : directories;
        }, [] as string[]);
    }

    fileExists(fileName: string): boolean {
        return this._resolutionHosts.some(host => host.fileExists(fileName));
    }

    readFile(fileName: string): string {
        return this._resolutionHosts.reduce<string>(
            (acc: string, host: ts.ModuleResolutionHost) => (!acc && host.fileExists(fileName))
                ? host.readFile(fileName)
                : acc,
            null);
    }

    getSourceFile(fileName: string): ts.SourceFile {
        const source = this.readFile(fileName);
        if (source) {
            const ast: ts.SourceFile = ts.createSourceFile(fileName, source, this._compilerOptions.target, true);
            const syntacticErors = this.getParserErrors(ast);
            if (syntacticErors.length > 0) {
                this.syntacticErrors.push(...syntacticErors);
                return null;
            } else {
                return ast;
            }
        } else {
            return null;
        }
    }

    getSyntacticErrors(): ts.Diagnostic[] {
        return this.syntacticErrors;
    }

    private getParserErrors(sourceFile: ts.SourceFile): ts.Diagnostic[] {
        // We're accessing here an internal property. It would be more legit to access it through
        // ts.Program.getSyntacticDiagsnostics(), but we want to bail out ASAP.
        return sourceFile['parseDiagnostics'];
    }
}

export class SingleFileHost extends HostBase implements ts.CompilerHost {
    private _output: string = '';
    private _map: string = null;
    private _declaration: string= '';

    constructor(private _ast: ts.SourceFile) {
        super();
    }

    public get output(): string {
        return this._output;
    }

    public get declaration(): string {
        return this._declaration;
    }

    public get sourceMap(): RawSourceMap {
        return JSON.parse(this._map);
    }

    fileExists(fileName: string): boolean {
        return fileName === this._ast.fileName;
    }

    readFile(fileName: string): string {
        if (fileName === this._ast.fileName) {
            return this._ast.text;
        }
    }

    getSourceFile(fileName: string): ts.SourceFile {
        if (fileName === this._ast.fileName) {
            return this._ast;
        }
    }

    writeFile(name: string, text: string, writeByteOrderMark: boolean) {
        if (fileExtensionIs(name, 'map')) {
            this._map = text;
        } else if(fileExtensionIs(name, 'd.ts')) {
            this._declaration = text;
        } else {
            this._output = text;
        }
    }
}
