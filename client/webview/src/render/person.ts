import type {G} from '@svgdotjs/svg.js';
import type {SvgFamily, SvgPerson} from "../types";
import {COLOR} from '../theme';
import {open} from '../lib/api';
import renderText from './text';

export default function renderPerson(fg: G, f: SvgFamily, p: SvgPerson) {
	for (const child of p.children) {
		const arrow = renderArrow(fg, p, child);
		arrow.fill('none');
		arrow.stroke({color: COLOR, width: 2});
	}

	const pg = fg.group();
	pg.translate(p.x, p.y);
	pg.addClass('person');

	pg.on('click', function () {
		open(f.uri, p.loc);
	});

	const rect = pg.rect(p.width, p.height);
	rect.radius(6);
	rect.fill('#fff');
	rect.stroke({color: COLOR, width: 2});

	renderText(pg, p.name, 12, {
		x: 0,
		y: 0,
		width: p.width,
		height: p.height,
	});

	for (const child of p.children) {
		renderPerson(fg, f, child);
	}
}

function renderArrow(g: G, from: SvgPerson, to: SvgPerson) {
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

	return g.path([['M', a.x, a.y], ['C', b.x, b.y, c.x, c.y, d.x, d.y]]);
}