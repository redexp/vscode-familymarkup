import type {HierarchyNode, HierarchyLink} from 'd3-hierarchy';

export type TreeData = {
	name: string,
	width: number,
	height: number,
	size: [number, number],
}

export interface FlexTree extends HierarchyNode<TreeData> {
	x?: number,
	y?: number,

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

export type GraphItem = GraphPerson & {children?: GraphPerson[]};

export type SvgFamily = {
	name: string,
	top: number,
	width: number,
	height: number,
	roots: Array<{
		top: number,
		left: number,
		width: number,
		height: number,
		nodes: FlexTree[],
		links: HierarchyLink<TreeData>[],
	}>,
};