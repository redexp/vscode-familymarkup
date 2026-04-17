import type {roundCommands} from 'svg-round-corners';
import type {Doc} from "./render/Docs.ts";

export type SvgFamily = Rect & {
	uri: string,
	loc: Loc,
	title: Node,
	bounding: Pos[],
	rows: Row[],
	roots: SvgPerson[],
};

export type SvgPerson = Rect & {
	loc: Loc,
	name: string,
	unknown: boolean,
	external: boolean,
	rel?: {
		separator?: string,
		label?: string,
	},
	children?: SvgPerson[],
	links?: SvgPersonLink[],
};

export type SvgPersonLink = Rect & {
	relation?: Dir,
	label: string,
};

export type SvgRelation = {
	label: string,
	sources: SvgPersonLink[],
	targets?: SvgPersonLink[],
};

export type Pos = {
	x: number,
	y: number,
};

export type Row = {
	top: number,
	left: number,
	right: number,
	bottom: number,
};

export type Rect = Pos & {
	width: number,
	height: number,
};

export type Loc = {
	start: {
		line: number,
		char: number,
	},
	end: {
		line: number,
		char: number,
	},
};

export type Node = Rect & {name: string};

export type BoundingPath = ReturnType<typeof roundCommands>;

export type Dir = -1 | 1;