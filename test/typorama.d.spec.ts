/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>
/// <reference path="../typings/tsd.d.ts" />

import { expect } from 'chai';

describe('typorama.d.ts', function () {
	this.timeout(10000);

	it('provides all necessary declarations', function () {
		const sampleSource = `
			/// <reference path="src/typorama.d.ts"/>

			import * as typorama from "typorama";

			class Product extends typorama.BaseType {
				title:string;
				price:number;
			}

			class Props extends typorama.BaseType {
				related:typorama.List<Product>;
				product: Product;
			}

			class ProductDisplayer {
				props: Props;
				onClick() {
					const a = this.props.product.getValue();
					const json = this.props.product.toJSON();
					const newVal = { title: 'Night cap', price: 1000 };
					if(Product.validateType(newVal)) {
						this.props.product.setValue(newVal);
					}
					if(!Product.isAssignableFrom(Props)) {
						console.log('whatever');
					}
					console.assert(Product.id === 'PRODUCT');
					const relatedTitle:string = this.props.related.at(1).title;
					const productList:typorama.List<Product> = this.props.related.filter((p:Product) => true);
					const l:number = this.props.related.length;
					this.props.related.push(new Product());
					const p:Product = this.props.related.pop();
					const newArr:typorama.List<Product> = this.props.related.concat(productList);
					const str:string = this.props.related.join(':');
					this.props.related = this.props.related.reverse();
					const p2:Product = this.props.related.shift();
					const newArr2:typorama.List<Product> = this.props.related.slice(0,1);
					const newArr3:typorama.List<Product> = this.props.related.sort();
					const newArr4:typorama.List<Product> = this.props.related.splice(0, 1, new Product());
					this.props.related.unshift(new Product(), new Product());
					const index1:number = this.props.related.indexOf(this.props.related.at(3));
					const index2:number = this.props.related.lastIndexOf(this.props.related.at(3));
					const p4:Product = this.props.related.reduce((acc:Product, p:Product) => p, null);
					const str2:string = this.props.related.reduce<string>((acc:string, p:Product) => p.title, '');
				}
			}


		`;

		expect(sampleSource).to.passTypecheck();
	});
});
