import {roundCommands} from 'svg-round-corners';

export type SvgFamily = Rect & {
	title: Node,
	bounding: Pos[],
	rows: Row[],
	roots: SvgRoot[],
};

export type SvgRoot = Rect & {
	person: SvgPerson,
};

export type SvgPerson = Rect & {
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

export type Node = Rect & {name: string};

export type BoundingPath = ReturnType<typeof roundCommands>;