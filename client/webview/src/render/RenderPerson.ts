import type {G, Rect as SvgRect, Text, Circle, Line, Element} from '@svgdotjs/svg.js';
import type {Loc, Pos, Rect, SvgPerson} from "../types";
import type {RenderFamily} from './RenderFamily.ts';
import toRect from "../lib/toRect.ts";
import {themeColors} from "../theme.ts";
import {applyFontStyle} from "./text.ts";

const DIAMETER = 10;
const R = DIAMETER / 2;

export class RenderPerson {
	rect: Rect;
	loc: Loc;
	group: G;
	unknown = false;
	bg: SvgRect;
	name: {
		node: Text,
	};
	pointers: Pointer[] = [];
	isOver: boolean = false;

	constructor(f: RenderFamily, p: SvgPerson, pg: G) {
		this.loc = p.loc;
		this.group = pg;
		this.rect = toRect(p, f.rect);
		this.unknown = p.unknown;
		this.bg = pg.get(0) as SvgRect;
		this.name = {
			node: pg.get(1) as Text,
		};

		this.updateThemeColors();

		this.group.on('mouseenter', this.onMouseEnter);
		this.group.on('mouseleave', this.onMouseLeave);
	}

	updateThemeColors() {
		const style = (
			this.unknown ?
				themeColors.unknown :
				themeColors.person
		);

		applyFontStyle(this.name.node, style);

		if (this.unknown) {
			this.bg.stroke({color: style.foreground});
		}
	}

	onMouseEnter = () => {
		const {pointers} = this;

		if (pointers.length === 0 || this.isOver) return;

		this.isOver = true;

		const startPos = stackVertically(pointers);

		for (let i = 0; i < pointers.length; i++) {
			const p = pointers[i];
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

	onMouseLeave = () => {
		const {pointers} = this;

		if (pointers.length === 0 || !this.isOver) return;

		this.isOver = false;

		for (const p of pointers) {
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
}

export type Pointer = {
	c: Circle,
	label?: G,
	width?: number,
	side: -1 | 1,
	line: Line,
	start: Pos,
	cut: Pos,
	end: Pos,
};

function stackVertically(pointers: Pointer[]): Pos[] {
	if (pointers.length === 0) return [];

	const start = pointers[0].start;

	if (pointers.length === 1) return [start];

	const totalHeight = pointers.length * DIAMETER;

	let top = start.y - totalHeight / 2;

	return pointers.map(() => {
		const y = top + DIAMETER / 2;

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