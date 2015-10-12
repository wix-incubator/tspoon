import * as _ from 'lodash';

const typorama = require('typorama');
const baseComponent = require('wix-react-comp');

export interface Core3Decorator {
	(any): any;
	metadata(any): any;
	type(any): any;
	component(any): any;
}

function storeMetadata(target, metadata) {
	Object.defineProperty(target, '__meta__', {
		get() {
			return metadata;
		}
	});
}

function retrieveMetadata(target) {
	if(!target.__meta__) {
		throw 'No metadata defined on the class.';
	} else {
		return target.__meta__;
	}
}

function baseTypeDecorator(target, metadata) {
	// YES, this hacky shit should be fixed in typorama
	target.defaults = target.defaults || function () { return {}; };
	target.wrapValue = target.wrapValue || function (value) { return value; };
	// END OF HACKY SHIT

	var defaultValues = new target;

	var spec = _.reduce(metadata.properties, function (acc, item:any) {
		acc[item.name] = item.name in defaultValues
			? item.type.withDefault(defaultValues[item.name])
			: item.type;
		return acc;
	}, {});
	return typorama.define(metadata.name, { spec: function () { return spec; } } /*, target.__meta__.extends*/);
}

function enumTypeDecorator(target, metadata) {
	const valList = _.filter(metadata.properties, <any>{ 'isStatic': true });
	const spec = valList.reduce((acc, item:any) => {
		const key:string = item.name;
		const value = target[key] === undefined ? key : target[key];
		if(item.type === typorama.String || (item.type === null && typeof value === 'string')) {
			acc[key] = value;
		} else {
			throw new Error('The only permitted value type is string');
		}
		return acc;
	}, {});
	return typorama.defineEnum(spec);
}

function typeDecorator(target) {
	const metadata = retrieveMetadata(target);
	let Type;
	if(metadata['extends'] === typorama.Enum) {
		Type = enumTypeDecorator(target, metadata);
	} else {
		Type = baseTypeDecorator(target, metadata);
	}
	storeMetadata(Type, metadata);
	return Type;
}

function componentDecorator(target) {
	const metadata = retrieveMetadata(target);
	const props = _.find(metadata.properties, { name: 'props'});
	const state = _.find(metadata.properties, { name: 'state'});
	let data:any = {};
	if(props) {
		data.props = { type: (<any>props).type };
	}
	if(state) {
		data.state = { type: (<any>state).type };
	}
	const methods = _.chain(Object.keys(target.prototype))
		.filter(key => _.isFunction(target.prototype[key]))
		.reduce((acc, key) => {
			const methodMetadata = _.find(metadata.methods, { name: key });
			acc[key] = {
				access: methodMetadata ? 'public' : 'private',
				userCode: target.prototype[key]
			};
			return acc;
		}, {})
		.valueOf();

	let Component = baseComponent.createComponent(metadata.name, { data, methods });
	storeMetadata(Component, metadata);
	return Component;
}

function metadataDecorator(metadata) {
	return (target) => {
		storeMetadata(target, metadata);
		return target;
	}
}

let core3 = <Core3Decorator> function core3(target) {
	const metadata = retrieveMetadata(target);
	const baseClass = metadata['extends'];
	if(baseClass === typorama.BaseType || baseClass === typorama.Enum) {
		return typeDecorator(target);
	} else if(baseClass === baseComponent.BaseComponent) {
		return componentDecorator(target);
	} else {
		console.warn('@core3 can be applied only to classes extending BaseType, Enum or BaseComponent.')
		return target;
	}
};

core3.metadata = metadataDecorator;
core3.type = typeDecorator;
core3.component = componentDecorator;

export default core3;
