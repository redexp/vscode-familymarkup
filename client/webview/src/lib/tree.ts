import {flextree} from 'd3-flextree';
import type {GraphItem, FlexTree, GraphFamily, SvgFamily} from '../types';

export const style = {
	family: {
		title: {
			fontSize: 16,
		},

		padding: {
			y: 20,
			x: 25,
		},
		gap: 15,
	},
	person: {
		height: 30,
		padding: {y: 20},
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

			return {
				top: style.family.padding.y + style.family.title.fontSize + style.person.height / 2,
				left: Math.abs(left),
				width: right - left,
				height: bottom - style.person.height / 2,
				nodes: root.descendants(),
				links: root.links(),
			};
		});

		let width = 0;
		let height = 0;

		for (let i = 0; i < roots.length; i++) {
			const root = roots[i];

			width += root.width;
			height = Math.max(height, root.height);

			if (i === 0) {
				root.left += style.family.padding.x;
				continue;
			}

			const prev = roots[i - 1];

			root.left += prev.left + prev.width + style.family.gap;
		}

		const data: SvgFamily = {
			name: f.name,
			top: fTop,
			width: style.family.padding.x * 2 + width + style.family.gap * (roots.length - 1),
			height: style.family.padding.y * 2 + style.family.title.fontSize + height,
			roots,
		};

		fTop += data.height;

		return data;
	});
}