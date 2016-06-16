import ts = require('typescript');
import {RawSourceMap} from "../index";
import _ = require('lodash');

export type CodeRange = [number, number];
export interface CodeMapping {
    range: CodeRange,
    d: number;
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
        const newText: string = ast.text.slice(0, this.start) + this.str + ast.text.slice(this.end);
        const textSpan:ts.TextSpan = ts.createTextSpanFromBounds(this.start, this.end);
        const textChangeRange:ts.TextChangeRange = ts.createTextChangeRange(textSpan, this.str.length);
        return {
            ast: ast.update(newText, textChangeRange),
            mapping: [
                { range: [0, this.start + this.str.length -1 ], d: 0},
                { range: [this.start + this.str.length, newText.length-1 ], d: this.end - this.start - this.str.length }
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
        const newText: string = ast.text.slice(0, this.start) + this.str + ast.text.slice(this.start);
        const textSpan:ts.TextSpan = ts.createTextSpanFromBounds(this.start, this.start);
        const textChangeRange:ts.TextChangeRange = ts.createTextChangeRange(textSpan, this.str.length);
        const segment0: CodeMapping[] = this.start > 0 ? [{ range: [0, this.start-1], d: 0 }] : [];
        return {
            ast: ast.update(newText, textChangeRange),
            mapping: segment0.concat([
                { range: [this.start, this.start + this.str.length-1], d: null },
                { range: [this.start + this.str.length, newText.length-1], d: -this.str.length }
            ])
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

        this._codeMapping.sort(function (item1: CodeMapping, item2: CodeMapping) {
            if(item1.range[0] === item2.range[0]) {
                return item1.range[1] - item2.range[1];
            } else {
                return item1.range[0] - item2.range[0];
            }
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
        const mapItem = _.find(this._codeMapping, item => position >= item.range[0] && position <= item.range[1]);
        if(!mapItem) {
            throw new Error(`Couldn't map target position ${position} to source.`);
        }
        return mapItem.d === null ? -1 : mapItem.d + position;
    }

    remapSourceMap(sourceMap: RawSourceMap): RawSourceMap {
        return null;
    }
}

