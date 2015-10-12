// Type definitions for magic-string v 0.6.6
// Project: https://github.com/Rich-Harris/magic-string
// Definitions by: Amir Arad <https://github.com/amir-arad>

/// <reference path="../source-map/source-map.d.ts" />

declare module 'magic-string' {

	interface SourceMap extends SourceMap.RawSourceMap{

	}

	interface Exclusion{
		0: number;
		1: number;
	}

	interface IndentOptions {
		exclude?: Exclusion| Array<Exclusion>;
		indentStart?: boolean;
	}

	interface MapOptions {
		file?: string;
		source?: string;
		includeContent?: boolean;
		hires?: boolean;
	}

	interface MagicStringOptions{
		filename?: string;
		indentExclusionRanges?: boolean;
	}

	class MagicString{
		constructor(string: string, options?: MagicStringOptions);
		addSourcemapLocation(char: number): void;
		append(content: string): MagicString;
		clone(): MagicString;
		generateMap(options?: MapOptions): SourceMap;
		getIndentString(): string;
		indent(indentStr: string, options?: IndentOptions): MagicString;
		insert(index: number, content: string ): MagicString;
		locate(index: number ): MagicString;
		locateOrigin(index: number ): number;
		overwrite(start: number, end: number, content: string ): MagicString;
		prepend(content: string ): MagicString;
		remove(start: number, end: number): MagicString;
		slice(start: number, end: number): MagicString;
		snip(start: number, end: number): MagicString;
		toString(): string;
		trim(charType?: string): MagicString;
		trimStart(charType?: string): MagicString;
		trimEnd(charType?: string): MagicString;
		trimLines(): MagicString;
		static Bundle;
	}

	interface BundleOptions{
		intro?: string;
		outro?: string;
		separator?: string;
	}

	interface BundleSource{
		filename?: string;
		separator?: string;
		content: MagicString;
	}

	class Bundle{
		constructor(options?: BundleOptions);
		addSource(source: BundleSource|MagicString): Bundle;
		append(string: string, options?: {seperator?:string}): Bundle;
		clone(): Bundle;
		generateMap(options: MapOptions): SourceMap;
		getIndentString(): string;
		indent(indentStr: string): Bundle;
		prepend(content: string ): Bundle;
		toString(): string;
		trim(charType: string): Bundle;
		trimStart(charType: string): Bundle;
		trimEnd(charType: string): Bundle;
		trimLines(): Bundle;
	}

	export = MagicString;
}
