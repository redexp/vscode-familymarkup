import type {Pos, SvgPointer} from "../types";
import type {RenderPerson} from "./RenderPerson.ts";
import {POINTER_COLOR} from '../theme';
import {pointers as container} from '../app';
import moveView from '../lib/moveView';

export default function renderPointers(rp: RenderPerson, pointers: SvgPointer[]) {
	if (!pointers || pointers.length === 0) return;

	rp.pointers = [];

	let dir = -1;

	const enter = () => {
		if (dir > 0) return;

		dir = 1;

		for (const item of rp.pointers) {
			const {c, line, end} = item;

			c.addClass('active');

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

		for (const item of rp.pointers) {
			const {c, line, cut} = item;

			c.removeClass('active');

			const r = line.animate();

			if (r.active()) {
				r.unschedule();
			}

			line.animate().to(cut.x, cut.y);
		}
	};

	rp.group.on('mouseenter', enter);
	rp.group.on('mouseleave', leave);

	const root = rp.rect;

	const base = {
		x: root.x,
		y: root.y + root.height / 2,
	};

	for (const {family, person} of pointers) {
		const start = {...base};

		const end = {
			x: family.x + person.x,
			y: family.y + person.y + person.height/2,
		};

		let min = Number.MAX_VALUE;
		for (const [s, e] of [
			[start.x + 10, end.x + 10],
			[start.x + 10, end.x + person.width - 10],
			[start.x + root.width - 10, end.x + 10],
			[start.x + root.width - 10, end.x + person.width - 10],
		]) {
			const v = Math.abs(s - e);
			if (v >= min) continue;
			min = v;
			start.x = s;
			end.x = e;
		}

		const cut = getLineEnd(start, end, 20);

		const line = container.line(start.x, start.y, cut.x, cut.y);
		line.addClass('pointer');
		line.stroke({
			color: POINTER_COLOR,
			width: 2,
		});

		const c = container.circle(10);
		c.addClass('pointer');
		c.center(start.x, start.y);
		c.fill(POINTER_COLOR);
		c.on('mouseenter', enter);
		c.on('mouseleave', leave);
		c.on('click', (e) => {
			e.stopPropagation();
			moveView(start, end);
		});

		rp.pointers.push({
			c,
			line,
			cut,
			end,
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