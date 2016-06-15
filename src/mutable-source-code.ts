import ts = require('typescript');
import {RawSourceMap} from "../index";


export type CodeRange = [number, number];
export interface CodeMapping {
    source: CodeRange,
    target: CodeRange
}

export abstract class MappedAction {
    abstract execute(ast:ts.SourceFile): MappedActinResult;

    abstract getStart():number;
}

interface MappedActinResult {
    ast: ts.SourceFile,
    mapping: CodeMapping[]
}

export abstract class FastAction {
    abstract execute(ast:ts.SourceFile):ts.SourceFile;
}

export type Action = MappedAction | FastAction;

export class ReplaceAction extends MappedAction {
    constructor(private start:number, private end:number, private str:string) {
        super();
    }

    execute(ast:ts.SourceFile): MappedActinResult {
        const origLength = ast.text.length;
        const newText: string = ast.text.slice(0, this.start) + this.str + ast.text.slice(this.end);
        const textSpan:ts.TextSpan = ts.createTextSpanFromBounds(this.start, this.end);
        const textChangeRange:ts.TextChangeRange = ts.createTextChangeRange(textSpan, this.str.length);
        return {
            ast: ast.update(newText, textChangeRange),
            mapping: [
                { source: [0, this.start-1], target: [0, this.start-1] },
                { source: [this.start, this.end], target: [this.start, this.start + this.str.length]},
                { source: [this.end + 1, origLength-1], target: [this.start + this.str.length +1, newText.length-1]}
            ]
        };
    }

    getStart():number {
        return this.start;
    }
}

export class InsertAction extends MappedAction {
    constructor(private start:number, private str:string) {
        super();
    }

    execute(ast:ts.SourceFile): MappedActinResult {
        const origLength = ast.text.length;
        const newText: string = ast.text.slice(0, this.start) + this.str + ast.text.slice(this.start);
        const textSpan:ts.TextSpan = ts.createTextSpanFromBounds(this.start, this.start);
        const textChangeRange:ts.TextChangeRange = ts.createTextChangeRange(textSpan, this.str.length);
        const mapSegment0 = this.start > 0
            ? { source: [0, this.start-1], target: [0, this.start-1] }
            : [];
        const mapSegment1 = { source: [this.start, origLength-1], target: [this.start + this.str.length, newText.length-1] };
        return {
            ast: ast.update(newText, textChangeRange),
            mapping: [].concat(mapSegment0, mapSegment1)
        };
    }

    getStart():number {
        return this.start;
    }
}

export class FastAppendAction extends FastAction {
    constructor(private str:string) {
        super();
    }

    execute(ast:ts.SourceFile):ts.SourceFile {
        const start = ast.text.length - 1;
        const textSpan:ts.TextSpan = ts.createTextSpanFromBounds(start, start);
        const textChangeRange:ts.TextChangeRange = ts.createTextChangeRange(textSpan, this.str.length);
        return ast.update(ast.text + this.str, textChangeRange);
    }
}

export class FastRewriteAction extends FastAction {
    constructor(private start:number, private str:string) {
        super();
    }

    execute(ast:ts.SourceFile):ts.SourceFile {
        const textSpan:ts.TextSpan = ts.createTextSpanFromBounds(this.start, this.start + this.str.length);
        const textChangeRange:ts.TextChangeRange = ts.createTextChangeRange(textSpan, this.str.length);
        const newText = ast.text.slice(0, this.start) + this.str + ast.text.slice(this.start + this.str.length);
        return ast.update(newText, textChangeRange);
    }
}


const compareActions = (action1:MappedAction, action2:MappedAction):number => (action2.getStart() - action1.getStart());

export class MutableSourceCode {

    private _ast:ts.SourceFile;
    private originalText:string;
    private origLineStarts:number[];
    private _codeMapping: CodeMapping[];

    constructor(ast:ts.SourceFile) {
        this._ast = ast;
        this.originalText = ast.text;
        this.origLineStarts = ast.getLineStarts();
    }

    get ast():ts.SourceFile {
        return this._ast;
    }

    execute(actionList:Array<Action>):void {
        this._codeMapping = [];
        const fastActions = <FastAction[]>actionList.filter(action => action instanceof FastAction);
        fastActions.forEach((action:FastAction) => {
            this._ast = action.execute(this._ast);
        });

        const sortedActions = actionList
            .filter(action => action instanceof MappedAction)
            .sort(compareActions);

        sortedActions.forEach((action:MappedAction) => {
            const { ast, mapping } = action.execute(this._ast);
            this._ast = ast;
            this._codeMapping.push(...mapping);
        });
    }

    get codeMapping():CodeMapping[] {
        return this._codeMapping;
    }

    get code():string {
        return this._ast.text;
    }

    translateDiagnostic(diag:ts.Diagnostic):ts.Diagnostic {
        return {
            file: diag.file,
            start: this.mapToSource(diag.start),
            length: diag.length,
            messageText: diag.messageText,
            category: diag.category,
            code: diag.code
        };
    }

    mapToSource(position: number): number {
        return NaN;
    }

    remapSourceMap(sourceMap: RawSourceMap): RawSourceMap {
        return null;
    }
}

