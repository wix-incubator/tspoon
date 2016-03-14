var ts = require('typescript');

module.exports = {
	filter : function filter(node){
		return node.kind === ts.SyntaxKind.PropertyDeclaration;
	},
	visit: function visit(node, context) {
		context.reportDiag(node, ts.DiagnosticCategory.Message, 'found property declaration "' + node.getText()+'"', false);
	}
};
