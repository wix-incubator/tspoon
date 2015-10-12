/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>
/// <reference path="../typings/tsd.d.ts" />

import { expect } from 'chai';
import { evaluateModuleExports, syntaxKindMap } from '../test-kit/index';
import { transpile } from '../src/index';
import * as React from 'react';
import * as typescript from 'typescript';
import { defaultCompilerOptions } from '../src/configuration';

describe('assumption', ()=> {
	it('preserves enum', () => {
		var source = `
		enum blah { a = 1 };
		export default blah;
		`;
		var transpiled = transpile(source, {
			'sourceFileName': 'wix/ecom/Product.js'
		});
		var result = evaluateModuleExports(transpiled.code, {});
		expect(result).to.eql({ "default": {1 : 'a', a : 1}});
	});
});

function extractSuperclassFromClassDeclaration(classDeclaration) {
	var heritageClause = classDeclaration.heritageClauses[0];
	heritageClause.kindName = syntaxKindMap[heritageClause.kind];
	var expression = heritageClause.types[0].expression;
	expression.kindName = syntaxKindMap[expression.kind];
	return {heritageClause, expression};
}

describe("AST", function() {
	it("has kind attribute", function() {

		var sourceCode = "class A { n: number = 3; }";
		var sourceFile = typescript.createSourceFile("file.ts", sourceCode, typescript.ScriptTarget.ES5, true);
		var statement = sourceFile.statements[0];
		statement["kindName"] = syntaxKindMap[statement.kind];
		var member = statement["members"][0];
		var memberType = member.type;
		memberType["kindName"] = syntaxKindMap[memberType.kind];

		expect(statement["kindName"]).to.equal("ClassDeclaration");
		expect(memberType["kindName"]).to.equal("NumberKeyword");
	});

	it("has decorators attribute", function() {
		var sourceCode = `
			@type
            class A { n: number = 3; }
        `;
		var sourceFile = typescript.createSourceFile("file.ts", sourceCode, typescript.ScriptTarget.Latest, true);
		var statement = sourceFile.statements[0];
		var decorator = statement.decorators[0];
		decorator["kindName"] = syntaxKindMap[decorator.kind];
		var expression = decorator.expression;
		expression["kindName"] = syntaxKindMap[expression.kind];

		expect(decorator["kindName"]).to.equal("Decorator");
		expect(expression["kindName"]).to.equal("Identifier");
		expect(expression["text"]).to.equal("type");

	});

	it("has heritage attribute", function() {
		var sourceCode = `
            class A extends B{ n: number = 3; }
        `;
		var sourceFile = typescript.createSourceFile("file.ts", sourceCode, typescript.ScriptTarget.Latest, true);
		var {heritageClause, expression} = extractSuperclassFromClassDeclaration(sourceFile.statements[0]);
		expect(heritageClause["kindName"]).to.equal("HeritageClause");
		expect(expression["kindName"]).to.equal("Identifier");
		expect(expression["text"]).to.equal("B");
	});
});

describe("module system", function() {
	// TODO: extract to a test kit
	function getTwoModules(codeA, codeB){
		var files = {
			'A.ts' : codeA,
			'B.ts' : '///<reference path="A.ts" />\n import A from "A";\n' +codeB
		};
		var servicesHost: typescript.LanguageServiceHost = {
			getScriptFileNames: () => Object.keys(files),
			getScriptVersion: () => '0',
			getScriptSnapshot: fileName => fileName && files[fileName] && typescript.ScriptSnapshot.fromString(files[fileName]),
			getCurrentDirectory: () => process.cwd(),
			getCompilationSettings: () => ({}),
			getDefaultLibFileName: options => typescript.getDefaultLibFilePath(options)
		};
		var services = typescript.createLanguageService(servicesHost, typescript.createDocumentRegistry());

		var transpiledA = services.getEmitOutput('A.ts').outputFiles[0].text;
		var transpiledB = services.getEmitOutput('B.ts').outputFiles[0].text;
		var evaluatedA = evaluateModuleExports(transpiledA, {});
		var dependencies = [{ depName : 'A', exportName : 'default', value : evaluatedA }];
		var evaluatedB = evaluateModuleExports(transpiledB, { dependencies });

		var program = services.getProgram();
		return {evaluatedA, evaluatedB, program};
	}

	it("basically works", function() {
		var {evaluatedA, evaluatedB} = getTwoModules(
			'class X { a: number = 3; }\nexport default X;',
			'class X extends A { b: number = 3; }\nexport default X;');

		var newB = new (<any>evaluatedB).default();
		expect(newB instanceof (<any>evaluatedA).default).to.equal(true);
	});

	it("supports static reflections", function() {
		var {program} = getTwoModules(
			'class X { a: number = 3; }\nexport default X;',
			'class X extends A { b: number = 3; }\nexport default X;');

		var sourceFile = program.getSourceFiles().filter(sf => sf.fileName === 'B.ts')[0];
		var classDeclaration = sourceFile.statements.filter(s => s.kind === typescript.SyntaxKind.ClassDeclaration)[0];
		var identifier = extractSuperclassFromClassDeclaration(classDeclaration).expression;

		var symbol = program.getTypeChecker().getSymbolAtLocation(identifier);
		var parentType  = program.getTypeChecker().getTypeOfSymbolAtLocation(symbol, identifier);
		expect(parentType.symbol.members).to.have.property('a');
		var memberAOnParent = parentType.symbol.members["a"];
		expect(memberAOnParent.valueDeclaration["type"].kind).to.equal(typescript.SyntaxKind.NumberKeyword);
	});
});

function testDecoratorMetadata() {
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
			if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
			switch (arguments.length) {
				case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
				case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
				case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
			}
		};
	var __metadata = (this && this.__metadata) || function (k, v) {
			if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
		};
	var Reflect;
	function test(arg1, arg2, arg3, arg4) {
		console.log(arg1, arg2, arg3, arg4);
	}
	var Test = (function () {
		function Test() {
		}
		__decorate([
			test,
			__metadata('design:type', Number)
		], Test.prototype, "n");
		return Test;
	})();
	return new Test();
}

describe("emitDecoratorMetadata compiler flag", ()=> {

	it("test 1", ()=> {

		var t = testDecoratorMetadata();
		console.log(t);
	});

	it.only("sends metadata to decorator", ()=> {
		const source = `
			function test() {
				console.log(args);
			}
			class Foo {}
			class Test {
				@test
				n: number;
				@test
				s: string;
				@test
				b: boolean;
				@test
				fn: (n: number)=>string;
				@test
				foo: Foo;
			}
			return new Test();
		`;

		let compilerOptions: typescript.CompilerOptions = defaultCompilerOptions;
		compilerOptions.emitDecoratorMetadata = true;
		compilerOptions.noEmitHelpers = false;

		const target = transpile(source, {
			sourceFileName: "test.ts",
			compilerOptions }).code;
		console.log(target);
		const result = eval(target);
	});
});


