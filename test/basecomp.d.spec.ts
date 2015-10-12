/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>
/// <reference path="../typings/tsd.d.ts" />

import { expect } from 'chai';

describe('basecomp.d.ts', function () {
	this.timeout(10000);

	it('provides all necessary declarations', function () {
		const sampleSource = `
			/// <reference path="src/basecomp.d.ts"/>
			/// <reference path="src/typorama.d.ts"/>

			import { BaseComp, DisplayObject, Layout, Dimensions } from "basecomp";
			import { BaseType} from "typorama";

			class TestComp extends BaseComp {
			}

			var props: BaseType = new BaseType();
			var context: any = {};

			var comp: TestComp = new TestComp(props, context);

			context = comp.getChildContext();

			comp.onAfterNew();
			comp.onStateChange();
			comp.componentWillReceiveProps(props);
			comp.componentDidMount();
			comp.shouldComponentUpdate();
			comp.componentWillMount();
			comp.createStyle();
			comp.componentWillUpdate();
			comp.render();
			comp.componentDidUpdate();
			comp.componentWillUnmount();

			let d: DisplayObject = new DisplayObject();
			props = d.props;
			var key: string = d.key;

			var layout: Layout = { marginTop: "10px" };
			var size: Dimensions = { width: "300px", height: "200px" };

			var cloned: BaseComp = d.toVDOMWithLayout(layout);
			var cloned: BaseComp = d.toVDOM(layout, size);
		`;

		expect(sampleSource).to.passTypecheck();
	});
});
