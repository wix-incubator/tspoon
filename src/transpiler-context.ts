import ts = require('typescript');
import {MutableSourceCode, Action, ReplaceAction} from './mutable-source-code';
import {Visitor, VisitorContext} from './visitor';
import {FastAppendAction} from './mutable-source-code';
import {FastRewriteAction} from './mutable-source-code';
import {InsertAction} from './mutable-source-code';

    export class TranspilerContext implements VisitorContext {

        private _halted = false;
        private _actions:Action[] = [];
        private _diags:ts.Diagnostic[] = [];

        constructor(private _fileName:string, private langServiceProvider:() => ts.LanguageService = null) {
        }

        isHalted():boolean {
            return this._halted;
        }

        insertLine(position:number, str:string):void {
            this.insert(position, str + '\n');
        }

        insert(position:number, str:string):void {
            this._actions.push(new InsertAction(position, str));
        }

        replace(start:number, end:number, str:string):void {
            this._actions.push(new ReplaceAction(start, end, str));
        }

        fastAppend(str:string):void {
            this._actions.push(new FastAppendAction(str));
        }

        fastRewrite(start:number, str:string):void {
            this._actions.push(new FastRewriteAction(start, str));
        }

        reportDiag(node:ts.Node, category:ts.DiagnosticCategory, message:string, halt?:boolean):void {
            let diagnostic:ts.Diagnostic = {
                file: node.getSourceFile(),
                start: node.getStart(),
                length: node.getEnd() - node.getStart(),
                messageText: message,
                category: category,
                code: 0
            };
            this._diags.push(diagnostic);
            this._halted = this._halted || halt;
        }

        pushDiag(diagnostic:ts.Diagnostic):void {
            this._diags.push(diagnostic);
        }

        get actions():Action[] {
            return this._actions;
        }

        get diags():ts.Diagnostic[] {
            return this._diags;
        }

        get halted():boolean {
            return this._halted;
        }

        get fileName():string {
            return this._fileName;
        }

        getLanguageService():ts.LanguageService {
            if (this.langServiceProvider) {
                return this.langServiceProvider();
            } else {
                return null;
            }

        }
    }

