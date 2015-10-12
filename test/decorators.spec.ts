/// <reference path="../src/typorama.d.ts"/>
import {expect} from 'chai';
import core3 from '../src/decorators';

const typorama = require('typorama');
const wixReactComp = require('wix-react-comp');

describe('metadata decorator', function () {
	it('stores metadata on a class property __meta__', function () {
		const sampleMetadata = { id: 'This is metadata'};
		const decorator = core3.metadata(sampleMetadata);
		const target = decorator(class SampleClass {});
		expect(target.__meta__).to.deep.equal(sampleMetadata);
	});
});

describe('type decorator', function () {
	describe('defines general Typorama type', function () {
		it('with primitive fields', function () {
			const ProductSource = class {
				title = 'Mr. Monkey';
				price = 666;

				static get __meta__() {
						return {
							'name': 'SampleProduct',
							'extends': typorama.BaseType,
							'properties': [
								{
									'name': 'title',
									'type': typorama.String
								},
								{
									'name': 'price',
									'type': typorama.Number
								}
							]
						}
					}
			}
			const Product = core3.type(ProductSource);
			expect(Product.__meta__).to.deep.equal(ProductSource.__meta__);
			expect(Product).to.be.defined.asTyporamaType
				.withId('SampleProduct')
				.withSpec({
					title: typorama.String.withDefault('Mr. Monkey'),
					price: typorama.Number.withDefault(666)
				});
		});

		it('even if some fields are omitted from __meta__', function () {
			const ProductSource  = class {
				title = 'Mr. Monkey';
				price = 666;

				static get __meta__() {
					return {
						'name': 'SampleProduct',
						'extends': typorama.BaseType,
						'properties': [
							{
								'name': 'price',
								'type': typorama.Number
							}
						]
					}
				}
			}
			const Product = core3.type(ProductSource);
			expect(Product).to.be.defined.asTyporamaType
				.withId('SampleProduct')
				.withSpec({
					price: typorama.Number.withDefault(666)
				});
		});

		it('even if properties are not defined on __meta__', function () {
			const ProductSource = class {
				title = 'Mr. Monkey';
				price = 666;

				static get __meta__() {
					return {
						'name': 'SampleProduct',
						'extends': typorama.BaseType
					}
				}
			};
			const Product = core3.type(ProductSource);
			expect(Product).to.be.defined.asTyporamaType
				.withId('SampleProduct')
				.withSpec({});
		});

		it('failing when no __meta__ is defined', function () {
			const ProductSource = class {
				title = 'Mr. Monkey';
				price = 666;
			}
			expect(() => core3.type(ProductSource)).to.throw('No metadata defined on the class.');
		});
	});

	describe('defines Typorama enum', function () {
		it('with simple fields', function () {
			const ApeSource = class Ape {
				// The 'undefined' value is used so that 'chimp' would be passed to ES5 target
				static chimp;
				static gorilla = 'MAMA GORILLA';
				static get __meta__() {
					return {
						'name': 'Ape',
						'extends': typorama.Enum,
						'properties': [
							{
								'name': 'chimp',
								'type': null,
								'isStatic': true
							},
							{
								'name': 'gorilla',
								'type': typorama.String,
								'isStatic': true
							},
						]
					}
				}
			};
			const Ape = core3.type(ApeSource);
			expect(Ape.__meta__).to.deep.equal(ApeSource.__meta__);
			expect(Ape).to.be.defined.asTyporamaEnum
				.withSpec({
					'chimp': 'chimp',
					'gorilla': 'MAMA GORILLA'
				});
		});

		it('failing with non-string value (by actual value)', function () {
			const ApeSource = class {
				static chimp;
				static gorilla = 1;
				static get __meta__() {
						return {
							'name': 'Ape',
							'extends': typorama.Enum,
							'properties': [
								{
									'name': 'chimp',
									'type': null,
									'isStatic': true
								},
								{
									'name': 'gorilla',
									'type': null,
									'isStatic': true
								},
							]
						}
					}
				}
			expect(() => core3.type(ApeSource)).to.throw('The only permitted value type is string');
		});

		it('failing with non-string value (by type)', function () {
			const ApeSource = class {
				// The 'undefined' value is used so that 'chimp' would be passed to ES5 target
				static get __meta__() {
					return {
						'name': 'Ape',
						'extends': typorama.Enum,
						'properties': [
							{
								'name': 'chimp',
								'type': null,
								'isStatic': true
							},
							{
								'name': 'gorilla',
								'type': typorama.Number,
								'isStatic': true
							},
						]
					}
				}
			}
			expect(() => core3.type(ApeSource)).to.throw('The only permitted value type is string');
		});
	})
});

describe('defines component', function () {
	it('with simple definition', function () {
		const ProductDisplayerSource = class {
			getProductPrice(discount:number):number { return null; }
			render() {}
			private _fairlyPrivateMethod() {}

			static __meta__ = {
				'name': 'ProductDisplayer',
				'extends': wixReactComp.BaseComponent,
				'properties': [
					{
						'name': 'props',
						'type': typorama.define('', { spec: () => ({ title: typorama.String.withDefault('') })})
					},
					{
						'name': 'state',
						'type': typorama.define('', { spec: () => ({ enabled: typorama.Boolean.withDefault(true) })})
					}
				],
				'methods': [
					{
						'name': 'getProductPrice',
						'params': [
							{
								'name': 'discount',
								'type': typorama.Number,
								'optional': false
							}
						],
						'type': typorama.Number
					},
					{
						'name': 'render',
						'params': [],
						'type': null
					}
				]
			};
		}
		const ProductDisplayer = core3.component(ProductDisplayerSource);
		expect(ProductDisplayer.__meta__).to.deep.equal(ProductDisplayer.__meta__);
		expect(ProductDisplayer).to.be.defined.asBaseComponent
			.withId('ProductDisplayer')
			.withPublicMethods(['getProductPrice', 'render'])
			.withPrivateMethods(['_fairlyPrivateMethod']);
		expect(ProductDisplayer).to.be.defined.asBaseComponent.withProps
			.defined.asTyporamaType.withSpec({
				title: typorama['String'].withDefault(''),
			});
		expect(ProductDisplayer).to.be.defined.asBaseComponent.withState
			.defined.asTyporamaType.withSpec({
				enabled: typorama['Boolean'].withDefault(true)
			});
	});
});
