import type {Pos, SvgPointer} from "../types";
import type {Pointer, RenderPerson} from "./RenderPerson.ts";
import type {Element, G} from "@svgdotjs/svg.js";
import {POINTER_COLOR, textWidth, themeColors} from '../theme';
import {pointers as container} from '../app';
import moveView from '../lib/moveView';

const DIAMETER = 10;
const R = DIAMETER/2;
const LABEL_SIZE = DIAMETER - 2;

export default function renderPointers(rp: RenderPerson, pointers: SvgPointer[]) {
	if (!pointers || pointers.length === 0) return;

	rp.pointers = [];

	let dir = -1;

	const enter = () => {
		if (dir > 0) return;

		dir = 1;

		const startPos = stackVertically(rp.pointers);

		for (let i = 0; i < rp.pointers.length; i++) {
			const p = rp.pointers[i];
			const {c, line, label, end} = p;
			const start = startPos[i];

			stopAnimation(c);

			c.animate().center(start.x, start.y);

			stopAnimation(line);

			line.animate().attr({
				x1: start.x,
				y1: start.y,
				x2: end.x,
				y2: end.y,
			});

			if (!label) continue;

			label.front();

			stopAnimation(label);

			label.addClass('active');
			label.animate().transform({
				translateX: start.x - R - (p.side === 1 ? 0 : p.width - DIAMETER),
				translateY: start.y - R,
			});
		}
	};

	const leave = () => {
		if (dir < 0) return;

		dir = -1;

		for (const p of rp.pointers) {
			const {c, line, label, start, cut} = p;

			stopAnimation(c);

			c.animate().center(start.x, start.y);

			stopAnimation(line);

			line.animate().attr({
				x1: start.x,
				y1: start.y,
				x2: cut.x,
				y2: cut.y,
			});

			if (!label) continue;

			stopAnimation(label);

			label.removeClass('active');
			label.animate().transform({
				translateX: start.x - R - (p.side === 1 ? 0 : p.width - DIAMETER),
				translateY: start.y - R,
			});
		}
	};

	rp.group.on('mouseenter', enter);
	rp.group.on('mouseleave', leave);

	const root = rp.rect;

	const base = {
		x: root.x,
		y: root.y + root.height / 2,
	};

	for (const {family, person, label} of pointers) {
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

		const side = start.x === base.x + 10 ? -1 : 1;

		const cut = getLineEnd(start, end, 20);

		const click = (e) => {
			e.stopPropagation();
			moveView(start, end);
		};

		const line = container.line(start.x, start.y, cut.x, cut.y);
		line.addClass('pointer');
		line.stroke({
			color: POINTER_COLOR,
			width: 2,
		});

		const c = container.circle(DIAMETER);
		c.addClass('pointer');
		c.center(start.x, start.y);
		c.fill(POINTER_COLOR);

		let lg: G;
		let lw: number;

		if (label) {
			const width = textWidth(label, LABEL_SIZE);
			lw = width + 8;

			lg = container.group();
			lg.addClass('pointer-label');
			lg.transform({
				translateX: start.x - R - (side === 1 ? 0 : lw - DIAMETER),
				translateY: start.y - R,
			});
			lg.on('mouseenter', enter);
			lg.on('mouseleave', leave);

			const rect = lg.rect(lw, DIAMETER);
			rect.radius(R);
			rect.stroke({
				color: POINTER_COLOR,
				width: 1,
			});
			const text = lg.plain(label);
			text.x(4);
			text.fill(themeColors.unknown.foreground);
			text.css({
				'font-size': LABEL_SIZE + 'px',
				'alignment-baseline': 'before-edge',
			});

			lg.on('mouseenter', enter);
			lg.on('mouseleave', leave);
			lg.on('click', click);
		}
		else {
			c.on('mouseenter', enter);
			c.on('mouseleave', leave);
			c.on('click', click);
		}

		rp.pointers.push({
			side,
			c,
			line,
			label: lg,
			width: lw,
			start,
			cut,
			end,
		});
	}

	rp.pointers.sort((p1, p2) => {
		if (p1.start.x !== p2.start.x) {
			return p1.start.x - p2.start.x;
		}

		return tan(p1) - tan(p2);
	});
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

function stackVertically(pointers: Pointer[]): Pos[] {
	if (pointers.length === 0) return [];

	const start = pointers[0].start;

	if (pointers.length === 1) return [start];

	const totalHeight = pointers.length * DIAMETER;

	let top = start.y - totalHeight / 2;

	return pointers.map(() => {
		const y = top + DIAMETER/2;

		top += DIAMETER;

		return {
			x: start.x,
			y,
		};
	});
}

function stopAnimation(el: Element) {
	const r = el.animate();

	if (r.active()) {
		r.unschedule();
	}
}

function tan(p: Pointer) {
	let a = atan2(p.start, p.end);

	if (a > Math.PI / 2) {
		a = Math.PI - a
	}

	return a;
}

function atan2(start: Pos, end: Pos) {
	const dx = end.x - start.x;
	const dy = end.y - start.y;

	return Math.atan2(dy, dx);
}