/// <reference path="./matchers.d.ts"/>
/// <reference path="../../typings/tsd.d.ts"/>

import {assert, expect} from 'chai';
import * as _ from 'lodash';

const typorama = require('typorama');

function isTyporamaClass(cls) {
	return cls.ancestors && cls.ancestors.indexOf('BaseType')>-1;
}

function isTyporamaEnum(cls) {
	return cls.name === 'EnumType';
}

function assertSpec(expectedSpec, actualSpec):void {
	const fieldList:string[] = Object.keys(expectedSpec);
	fieldList.forEach((fieldName) => {
		const expectedField = expectedSpec[fieldName];
		const actualField = actualSpec[fieldName];
		assert(!!actualField, `Expected ${fieldName} to be described in the spec.`);
		assert(expectedField.id === actualField.id,
			`Expected ${fieldName} to be of type '${expectedField.id}', but was ${actualField.id}.`);
		assert(_.isEqual(expectedField.defaults(), actualField.defaults()),
			`Expected ${fieldName} to have default value ${JSON.stringify(expectedField.defaults())}, but was ${JSON.stringify(actualField.defaults())}`);
	});
}


class ComponentMemberDefinition implements Matchers.ComponentMemberDefinition {
	constructor(private _assertion:Chai.Assertion) {}

	get defined():Core3Definition {
		return new Core3Definition(this._assertion);
	}
}

class TyporamaTypeDefinition implements Matchers.TyporamaTypeDefinition {

	private _typeDef: any;

	constructor(private _assertion:Chai.Assertion) {
		this._typeDef = this._assertion["_obj"];
		assert(isTyporamaClass(this._typeDef), `Expected ${this._typeDef} to be a Typorama class.`);
	}

	withId(id:string):Matchers.TyporamaTypeDefinition {
		assert.equal(id, this._typeDef.id);
		return this;
	}

	withSpec(spec:Object):Matchers.TyporamaTypeDefinition {
		assertSpec(spec, this._typeDef._spec);
		return this;
	}

	withMethods(methodList:string[]):Matchers.TyporamaTypeDefinition {
		assert(true);	// Right now, we ignore methods
		return this;
	}

	get and():Matchers.TyporamaTypeDefinition {
		return this;
	}

}

class TyporamaEnumDefinition implements Matchers.TyporamaEnumDefinition {

	private _enumDef:any;

	constructor(private _assertion:Chai.Assertion) {
		this._enumDef = this._assertion["_obj"];
		assert(isTyporamaEnum(this._enumDef), `Expected ${this._enumDef} to be a Typorama enum type.`);
	}

	withSpec(spec:Object):Matchers.TyporamaEnumDefinition {
		// TODO: Typorama enums should implement getter with the value list.
		// Right now we're only checking the value existence
		_.forEach(spec, (value, key:string) => {
			assert(spec[key] !== undefined, `Spec key ${key} cannot have undefined value.`);
			assert(this._enumDef[key] !== undefined, `Value ${key} not found on the type.`);
			const expectedValue = spec[key];
			const actualValue = this._enumDef[key].valueOf();
			assert(_.isEqual(expectedValue, actualValue), `Value of ${key} on the type expected to be "${expectedValue}" but was "${actualValue}"`);
		}, this);
		return this;
	}
}

class BaseComponentDefinition implements Matchers.BaseComponentDefinition {

	private _compDef: any;

	constructor(private _assertion:Chai.Assertion) {
		this._compDef = this._assertion["_obj"];
		// TODO: find better way to assert component class (wix-react-comp feature)
		assert(_.isFunction(this._compDef.prototype.render), `Expected ${this._compDef} to be a component class.`);
	}

	get withProps():Matchers.ComponentMemberDefinition {
		if(this._compDef.PropsType) {
			return new ComponentMemberDefinition(expect(this._compDef.PropsType));
		} else {
			assert.fail(`No props found on the component ${this._compDef.id}`);
		}

	}

	get withState():Matchers.ComponentMemberDefinition {
		if(this._compDef.StateType) {
			return new ComponentMemberDefinition(expect(this._compDef.StateType));
		} else {
			assert.fail(`No state found on the component ${this._compDef.id}`);
		}
	}

	withId(id:string):Matchers.BaseComponentDefinition {
		assert.equal(id, this._compDef.id);
		return this;
	}

	withPublicMethods(expectedMethods:string[]):Matchers.BaseComponentDefinition {
		const componentMethods = this._compDef.metadata.methods;
		expectedMethods.forEach(expectedMethod => {
			assert(!!componentMethods[expectedMethod], `Expected to find method ${expectedMethod} on the prototype`);
			assert(componentMethods[expectedMethod].access === 'public', `Expected ${expectedMethod} to be a public method`);
		});
		return this;
	}

	withPrivateMethods(expectedMethods:string[]):Matchers.BaseComponentDefinition {
		const componentMethods = this._compDef.metadata.methods;
		expectedMethods.forEach(expectedMethod => {
			assert(!!componentMethods[expectedMethod], `Expected to find method ${expectedMethod} on the prototype`);
			assert(componentMethods[expectedMethod].access === 'private', `Expected ${expectedMethod} to be a private method`);
		});
		return this;
	}
}

class Core3Definition implements Matchers.Core3Definition {
	constructor(private _assertion:Chai.Assertion) {}
	get asTyporamaType() {
		return new TyporamaTypeDefinition(this._assertion);
	}
	get asTyporamaEnum() {
		return new TyporamaEnumDefinition(this._assertion);
	}
	get asBaseComponent() {
		return new BaseComponentDefinition(this._assertion);
	}
}


export default function use(chai, util) {
	chai.Assertion.addProperty('defined', function () {
		return new Core3Definition(this);
	});
}

