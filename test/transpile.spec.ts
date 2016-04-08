import {expect} from 'chai';
import {Node, Decorator, ClassDeclaration, SyntaxKind, CompilerOptions} from 'typescript';
import * as _ from 'lodash';
import {transpile, TranspilerConfig, VisitorContext} from '../src';

const config: TranspilerConfig = {
    sourceFileName: 'sample.tsx',
    visitors: []
};

describe('transpiler', function() {
    it('fails on parser errors', function() {
        const source = 'let a = <div><div></div>;';
        const transpiled = transpile(source, config);
        expect(transpiled.code).not.to.be.ok;
        expect(transpiled.diags).not.to.be.empty;
    });

    describe('e2e regression test', () => {

        const config2: TranspilerConfig = {
            compilerOptions: <CompilerOptions>{
                inlineSourceMap: false,
                sourceMap: true,
                inlineSources: false,
                noEmitHelpers: false
            },
            sourceFileName: 'sample.tsx',
            visitors: [{
                filter: function(node: Node): boolean {
                    return node.kind == SyntaxKind.ClassDeclaration && node.decorators && node.decorators.length > 0;
                },

                visit: function(node: Node, context: VisitorContext): void {
                    let targetPosition: number = node.pos;
                    const classNode: ClassDeclaration = <ClassDeclaration>node;
                    if (!_.isEmpty(classNode.decorators)) {
                        targetPosition = (<Decorator>_.last(classNode.decorators)).end + 1;
                    }
                    //		console.log('targetPosition', targetPosition);
                    context.insertLine(targetPosition, `@fooo(\`------------------------
					'tags': ['@type'],
					'properties': [
						{
							'name': 'title',
							'type': 'core3.types.String'
						},
						{
							'name': 'price',
							'type': 'core3.types.Number'
						},
						{
							'name': 'flag',
							'type': 'core3.types.Boolean'
						},
						{
							'name': 'func',
							'type': 'core3.types.Function'
						}
					],
					'methods': []
				\`)`);
                }
            }]
        };

        it('checks sample code doesn\'t get garbled up the same way it once did', () => {
            const source = `
/// <reference path='../../../typings/tsd.d.ts'/>

function bar(){
}
var foo = bar;
var fooo = bar;

@bar
class ImageType {
}

@bar
class ImageProps {
}

@bar
class ImageState  {
}

export class CropUtils{
	static getContainLayout(imageWidth:number, imageHeight:number, boxWidth:number, boxHeight:number): Layout {
		var layout:Layout = { x:0, y:0 };
		var imageRatio = imageWidth / imageHeight;
		var boxRatio = boxWidth / boxHeight;
		if(imageRatio < boxRatio){
			layout.w = boxHeight * imageRatio;
			layout.h = boxHeight;
			layout.x = Math.round(boxWidth/2 - layout.w/2);
		} else {
			layout.w = boxWidth;
			layout.h = boxWidth / imageRatio;
			layout.y = Math.round(boxHeight/2 - layout.h/2);
		}
		return layout;
	}

	static getCoverLayout(imageWidth:number, imageHeight:number, boxWidth:number, boxHeight:number): Layout {
		var layout:Layout = { x:0, y:0 };
		var imageRatio = imageWidth / imageHeight;
		var boxRatio = boxWidth / boxHeight;
		if(imageRatio < boxRatio){
			layout.w = boxWidth;
			layout.h = Math.round(boxWidth / imageRatio);
			layout.y = Math.round(boxHeight/2 - layout.h/2);
		} else {
			layout.w = Math.round(boxHeight * imageRatio);
			layout.h = boxHeight;
			layout.x = Math.round(boxWidth/2 - layout.w/2);
		}
		return layout;
	}
}

@bar
export default class Image{
}
`;
            const transpiled = transpile(source, config2);
            expect(() => eval(transpiled.code)).not.to.throw();
        });
    });

});
