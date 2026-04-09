import type {G} from '@svgdotjs/svg.js';
import type {Pos, SvgPerson} from "../types";
import {textWidth, themeColors, LABEL_SIZE} from '../theme';
import renderText from './text';

export default function renderArrow(g: G, from: SvgPerson, to: SvgPerson) {
	const a = {
		x: from.x + from.width / 2,
		y: from.y + from.height / 2,
	};

	const d = {
		x: to.x + to.width / 2,
		y: to.y + to.height / 2,
	};

	const h = (to.y - from.y) * 0.75;

	const b = {
		x: a.x,
		y: a.y + h,
	};

	const c = {
		x: d.x,
		y: d.y - h,
	};

	const path = g.path([['M', a.x, a.y], ['C', b.x, b.y, c.x, c.y, d.x, d.y]]);
	path.addClass('arrow');
	path.fill('none');
	path.stroke({
		width: 2,
	});

	const separator = to.rel?.label || to.rel?.separator;

	if (separator) {
		const isLabel = !!to.rel.label;
		const pos = getCenterPoint(a, d);

		const sep = g.group();
		sep.addClass('separator');
		sep.translate(pos.x, pos.y);

		const width = textWidth(separator, LABEL_SIZE) + 8;
		const height = LABEL_SIZE + 2;
		const bg = sep.rect(Math.max(width, height), height);
		bg.radius(6);
		bg.css({
			'transform': `translate(-50%, -50%)`,
			'transform-box': 'fill-box',
		});
		bg.stroke({
			width: isLabel ? 0 : 1,
		});

		const text = renderText(sep, separator, LABEL_SIZE);
		text.fill(
			isLabel ?
				themeColors.unknown.foreground :
				themeColors.separator.foreground
		);

		if (isLabel) {
			text.addClass('label');
		}
	}
}

function getCenterPoint(p1: Pos, p2: Pos): Pos {
	return {
		x: (p1.x + p2.x) / 2,
		y: (p1.y + p2.y) / 2
	};
}