var ts = require('typescript');

module.exports = {
	filter : function filter(node){
		return node.kind === ts.SyntaxKind.PropertyDeclaration
			&& node.modifiers
			&& node.modifiers.some(function(m){
				return m.kind === ts.SyntaxKind.PrivateKeyword;
			});
	},
	visit: function visit(node, context) {
		context.replace(node.getStart(), node.getEnd(), '');
		context.reportDiag(node, ts.DiagnosticCategory.Message, 'deleted field "' + node.getText()+'"', false);
	}
};
