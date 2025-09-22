import {roundCommands} from 'svg-round-corners';

export type SvgFamily = Rect & {
	title: Node,
	boundingPath: BoundingPath,
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

export type Row = {
	top: number,
	left: number,
	right: number,
	bottom: number,
};

export type Rect = {
	x: number,
	y: number,
	width: number,
	height: number,
};

export type Node = Rect & {name: string};

export type BoundingPath = ReturnType<typeof roundCommands>;