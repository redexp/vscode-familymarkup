import type {G, Line} from '@svgdotjs/svg.js';
import type {Pos, SvgPerson} from "../types";
import type {RenderFamily} from "./RenderFamily";
import {POINTER_COLOR} from '../theme';
import {pointers} from '../app';
import moveView from '../lib/moveView';

export default function renderPointers(pg: G, f: RenderFamily, p: SvgPerson) {
	if (!p.pointers) return;

	const arrows: Array<{line: Line, end: Pos, cut: Pos}> = [];

	let dir = -1;

	const enter = () => {
		if (dir > 0) return;

		dir = 1;

		for (const item of arrows) {
			const {line, end} = item;
			const r = line.animate();

			if (r.active()) {
				r.unschedule();
			}

			line.animate().to(end.x, end.y);
		}
	};

	const leave = () => {
		if (dir < 0) return;

		dir = -1;

		for (const item of arrows) {
			const {line, cut} = item;
			const r = line.animate();

			if (r.active()) {
				r.unschedule();
			}

			line.animate().to(cut.x, cut.y);
		}
	};

	pg.on('mouseenter', enter);
	pg.on('mouseleave', leave);

	const base = {
		x: f.rect.x + p.x,
		y: f.rect.y + p.y + p.height/2,
	};

	for (const {family, person} of p.pointers) {
		const start = {...base};

		const end = {
			x: family.x + person.x,
			y: family.y + person.y + person.height/2,
		};

		let min = Number.MAX_VALUE;
		for (const [s, e] of [
			[start.x + 10, end.x + 10],
			[start.x + 10, end.x + person.width - 10],
			[start.x + p.width - 10, end.x + 10],
			[start.x + p.width - 10, end.x + person.width - 10],
		]) {
			const v = Math.abs(s - e);
			if (v >= min) continue;
			min = v;
			start.x = s;
			end.x = e;
		}

		const cut = getLineEnd(start, end, 20);

		const c = pg.circle(10);
		c.addClass('pointer');
		c.center(start.x - base.x, p.height/2);
		c.fill(POINTER_COLOR);
		c.on('click', (e) => {
			e.stopPropagation();
			moveView(start, end);
		});

		const arrow = pointers.line(start.x, start.y, cut.x, cut.y);
		arrow.addClass('pointer');
		arrow.stroke({
			color: POINTER_COLOR,
			width: 2,
		});
		arrow.on('mouseenter', enter);
		arrow.on('mouseleave', leave);

		arrows.push({
			line: arrow,
			cut,
			end: end,
		});
	}
}

function getLineEnd({x: x1, y: y1}: Pos, {x: x2, y: y2}: Pos, newLength: number): Pos {
	const dx = x2 - x1;
	const dy = y2 - y1;

	const l = Math.sqrt(dx * dx + dy * dy);

	if (l === 0) {
		return {x: x1 + newLength, y: y1};
	}

	return {
		x: x1 + (dx / l) * newLength,
		y: y1 + (dy / l) * newLength,
	};
}
