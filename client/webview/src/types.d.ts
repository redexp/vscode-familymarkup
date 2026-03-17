import {roundCommands} from 'svg-round-corners';

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
	children: SvgPerson[],
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