import ts = require('typescript');

function printMessage(messageText:string | ts.DiagnosticMessageChain):string {
	if(messageText["messageText"]) {
		return printMessage((<ts.DiagnosticMessageChain>messageText).messageText);
	} else {
		return messageText.toString();
	}
}


export function printDiagnostic(diagnostic: ts.Diagnostic) {
	const linePos: ts.LineAndCharacter = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
	const message: string = printMessage(diagnostic.messageText);
	return `${diagnostic.file.fileName} -> ${linePos.line}:${linePos.character} ${message}`;
}

