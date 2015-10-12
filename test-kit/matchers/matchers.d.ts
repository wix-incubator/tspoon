/// <reference path="../../typings/tsd.d.ts"/>
declare module Chai {
	interface Assertion {
		matchCode(code:string);
		transpileTo(code:string):Matchers.MapCodeFragment;
		passTypecheck():Assertion;
		defined:Matchers.Core3Definition;
	}
}

declare module Matchers {
	interface MapCodeFragment {
		mapCodeFragment(originalSnippet:string): GeneratedCode;
		and:MapCodeFragment;
		to:MapCodeFragment;
	}

	interface GeneratedCode {
		toGeneratedCode(generatedSnippet?:string):MapCodeFragment;
	}

	interface Core3Definition {
		asTyporamaType:TyporamaTypeDefinition;
		asTyporamaEnum:TyporamaEnumDefinition;
		asBaseComponent:BaseComponentDefinition;
	}

	interface TyporamaTypeDefinition {
		withId(id:string):TyporamaTypeDefinition;
		withSpec(spec:Object):TyporamaTypeDefinition;
		withMethods(methodList:string[]):TyporamaTypeDefinition;
		and:TyporamaTypeDefinition;
	}

	interface TyporamaEnumDefinition {
		withSpec(spec:Object):TyporamaEnumDefinition;
	}

	interface BaseComponentDefinition {
		withId(id:string):BaseComponentDefinition;
		withProps:ComponentMemberDefinition;
		withState:ComponentMemberDefinition;
		withPublicMethods(methodList:string[]):BaseComponentDefinition;
		withPrivateMethods(mthodList:string[]):BaseComponentDefinition;
	}

	interface ComponentMemberDefinition {
		defined:Core3Definition;
	}
}

