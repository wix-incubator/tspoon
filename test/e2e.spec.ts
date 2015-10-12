/// <reference path="../typings/tsd.d.ts" />

import { expect } from 'chai';
import { evaluateModuleExports } from '../test-kit/index';
import { transpile } from '../src/index';
import * as React from 'react';
import * as _ from 'lodash';

const typorama = require('typorama');


describe('e2e test', ()=> {
    var source, transpiled, moduleInstance;
    beforeEach(()=> {
        source = `
        import * as core3 from "core3";
        import * as typorama from "typorama";
        import {BaseType, Enum} from "typorama";
        import {BaseComponent} from "wix-react-comp";
        import * as React from "react";

        @core3
        export default class Product extends BaseType {
            title:string;
            price:number = 666;
            aMethod() {
				var value = 'method';
                return \`A \${value}.\`;
            }
            getDiscountFn(autoDiscount=0.05) {
                return (n) => (1-(n+autoDiscount)) * this.price;
            }
			getObjectShort(){
				var value = '';
				return {
					value
				};
			}
        }

        @core3
        class PropsType extends BaseType{
            title: string;
            product: Product;
        }

        @core3
        class StateType extends BaseType{
            enabled: boolean = true;
        }

        @core3
        export class ProductSize extends Enum {
        	static X:string;
        	static L:string;
        	static XL:string;
        }

        @core3
        export class ProductDisplayer extends BaseComponent {
            props: PropsType;
            state: StateType;
            getProductPrice():number {
                return this.props.product.price;
            }
            render() {
                return <p>{this.props.title + ": " + this.props.product.price}</p>;
            }
            private _fairlyPrivateMethod() {
            	return 'prd';
            }

        }

`;
        transpiled = transpile(source, {
            'sourceFileName': 'wix/ecom/Product.js'
        });
        moduleInstance = evaluateModuleExports(transpiled.code, {});

    });

    it('transpiles es6 @type class to typorama type', () => {
        const Product = moduleInstance.default;
		expect(Product).to.be.defined.asTyporamaType
			.withId('Product')
			.and.withSpec({
				title: typorama['String'],
				price: typorama['Number'].withDefault(666)
			})
			.and.withMethods(['getDiscountFn', 'getObjectShort']);
    });

	it('transpiles es6 @type class to typorama enum type', () => {
		const ProductSize = moduleInstance.ProductSize;
		expect(ProductSize).to.be.defined.asTyporamaEnum
			.withSpec({
				'X': 'X',
				'L': 'L',
				'XL': 'XL'
			});
	});

    it('transpiles, es6 @component class to baseComponent class', () => {
		const Product = moduleInstance.default;
        const ProductDisplayer = moduleInstance.ProductDisplayer;
		expect(ProductDisplayer).to.be.defined.asBaseComponent
			.withId('ProductDisplayer')
			.withPublicMethods(['getProductPrice', 'render'])
			.withPrivateMethods(['_fairlyPrivateMethod']);
		expect(ProductDisplayer).to.be.defined.asBaseComponent.withProps
			.defined.asTyporamaType.withSpec({
				title: typorama['String'],
				product: Product
			});
		expect(ProductDisplayer).to.be.defined.asBaseComponent.withState
			.defined.asTyporamaType.withSpec({
				enabled: typorama['Boolean'].withDefault(true)
			});
    });

    it.skip('generates correct source maps while transpiling', () => {
		expect(source).to.transpileTo(transpiled)
            .and.mapCodeFragment('return (n) => (1-(n+autoDiscount)) * this.price;')
            	.toGeneratedCode('return function (n) { return (1 - (n + autoDiscount)) * _this.price; };')
            .and.mapCodeFragment('return `A ${value}.`;')
				.toGeneratedCode('return "A " + value + ".";');
    });
});

