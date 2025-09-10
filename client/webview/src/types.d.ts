import type {HierarchyNode} from 'd3-hierarchy';
import type {SVGCommand} from 'svg-round-corners';

export type TreeData = {
	name: string,
	width: number,
	height: number,
	size: [number, number],
}

export interface FlexTree extends HierarchyNode<TreeData> {
	x: number,
	y: number,
	width: number,
	height: number,

	extents: {
		left: number,
		right: number,
		top: number,
		bottom: number,
	},
}

export type GraphFamily = {
	name: string,
	rootPersons: GraphPerson[],
}

export type GraphPerson = {
	type: 1 | 2, // 1 - default, 2 - unknown
	name: string,
	relations?: GraphRelation[],
}

export type GraphRelation = {
	partners: GraphPerson[],
	children: GraphPerson[],
}

export type GraphItem = GraphPerson & { children?: GraphPerson[] };

export type SvgFamily = {
	title: Node,
	top: number,
	width: number,
	height: number,
	boundingPath?: SVGCommand[],
	rows: Array<{ top: number, left: number, right: number }>,
	roots: Array<Rect & {
		nodes: Node[],
		links: Link[],
	}>,
};

export type Rect = {
	x: number,
	y: number,
	width: number,
	height: number,
};

export type Node = Rect & {name: string};

export type Link = {source: Node, target: Node};