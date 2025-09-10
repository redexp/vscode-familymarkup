import {flextree} from 'd3-flextree';
import type {GraphItem, FlexTree, GraphFamily, SvgFamily, Rect, Link} from '../types';

export const style = {
	family: {
		title: {
			fontSize: 16,
			charWidth: 19,
		},

		padding: {
			y: 20,
			x: 20,
		},
		gap: 15,
	},
	person: {
		height: 30,
		padding: {y: 20},
		margin: {x: 10, bottom: 20},
	},
};

const layout = flextree({});

export function createTree(treeData: GraphItem): FlexTree {
	const root = layout.hierarchy(
		treeData,
		function (item: GraphItem) {
			return item.children;
		}
	) as FlexTree;

	const p = style.person.padding.y;

	root.each(d => {
		d.data.width = d.data.name.length * 7.23 + p;
		d.data.height = style.person.height;
		d.data.size = [d.data.width + p, d.data.height + p];
	});

	layout(root);

	return root;
}

export function createSvgFamilies(families: GraphFamily[]): SvgFamily[] {
	let fTop = 0;

	return families.map(f => {
		const roots = f.rootPersons.map(p => {
			const root = createTree(p);
			const {left, right, bottom} = root.extents;
			const nodes = root.descendants();
			const links = root.links();

			for (const node of nodes) {
				node.x += -left - node.data.width / 2 - style.person.margin.x;
				node.width = node.data.width;
				node.height = node.data.height;
				//@ts-ignore
				node['name'] = node.data.name;
			}

			return {
				x: 0,
				y: 0,
				width: right - left - style.person.margin.x * 2,
				height: bottom - style.person.margin.bottom,
				nodes: nodes as Rect[],
				// @ts-ignore
				links: links as Link[],
			};
		});

		let width = 0;
		let height = 0;
		const rows = new Map<number, Row>();

		for (let i = 0; i < roots.length; i++) {
			const root = roots[i];

			width += root.width;
			height = Math.max(height, root.height);

			for (const node of root.nodes) {
				const top = node.y;
				const left = node.x;
				const right = left + node.width;

				const row = rows.get(top);

				if (!row) {
					rows.set(top, {top, left, right});
					continue;
				}

				row.left = Math.min(row.left, left);
				row.right = Math.max(row.right, right);
			}

			if (i === 0) continue;

			const prev = roots[i - 1];

			root.x = prev.x + prev.width + style.family.gap;
		}

		const data: SvgFamily = {
			top: fTop,
			width: style.family.padding.x * 2 + width + style.family.gap * (roots.length - 1),
			height: style.family.padding.y * 2 + style.family.title.fontSize + height,
			//@ts-ignore
			roots: roots,
			rows: alignRows(f.name, Array.from(rows.values())),
		};

		const titleRow = data.rows[0];

		data.title = {
			name: f.name,
			x: titleRow.left + style.family.padding.x,
			y: titleRow.top + style.family.padding.y,
			width: titleRow.right - titleRow.left - style.family.padding.x * 2,
			height: style.family.title.fontSize,
		};

		fTop += data.height;

		return data;
	});
}

type Row = {
	top: number,
	left: number,
	right: number,
};

function alignRows(name: string, rows: Row[]): Row[] {
	const first = rows[0];
	const nameWidth = name.length * style.family.title.fontSize * 0.65;

	const title: Row = {
		top: first.top - style.family.title.fontSize,
		left: first.left + (first.right - first.left) / 2 - nameWidth / 2,
		right: nameWidth,
	};

	title.right += title.left;

	rows.unshift(title);

	const len = rows.length;

	if (len === 1) return rows;

	let minLeft = Number.MAX_VALUE;
	let maxRight = Number.MIN_VALUE;
	let minLeftIndex = 0;
	let maxRightIndex = 0;

	rows.sort(function (a, b) {
		return a.top - b.top;
	});

	for (let i = 0; i < len; i++) {
		const row = rows[i];

		row.top -= style.family.padding.y;
		row.left -= style.family.padding.x;
		row.right += style.family.padding.x;

		if (row.left < minLeft) {
			minLeft = row.left;
			minLeftIndex = i;
		}

		if (row.right > maxRight) {
			maxRight = row.right;
			maxRightIndex = i;
		}
	}

	let prevLeft = rows[0].left;
	let prevRight = rows[0].right;

	for (let i = 1; i < len; i++) {
		const row = rows[i];

		if (i < minLeftIndex && row.left > prevLeft) {
			row.left = prevLeft;
		}

		if (i < maxRightIndex && row.right < prevRight) {
			row.right = prevRight;
		}

		prevLeft = row.left;
		prevRight = row.right;
	}

	for (let i = len - 2; i >= 0; i--) {
		const row = rows[i];

		if (i > minLeftIndex && row.left > prevLeft) {
			row.left = prevLeft;
		}

		if (i > maxRightIndex && row.right < prevRight) {
			row.right = prevRight;
		}

		prevLeft = row.left;
		prevRight = row.right;
	}

	const MIN_STEP = 10;

	for (let i = 1; i < len; i++) {
		const row = rows[i];

		if (i > minLeftIndex && row.left - prevLeft < MIN_STEP) {
			row.left = prevLeft;
		}

		if (i > maxRightIndex && prevRight - row.right < MIN_STEP) {
			row.right = prevRight;
		}

		prevLeft = row.left;
		prevRight = row.right;
	}

	for (let i = len - 2; i >= 0; i--) {
		const row = rows[i];

		if (i < minLeftIndex && row.left - prevLeft < MIN_STEP) {
			row.left = prevLeft;
		}

		if (i - maxRightIndex && prevRight - row.right < MIN_STEP) {
			row.right = prevRight;
		}

		prevLeft = row.left;
		prevRight = row.right;
	}

	return rows;
}