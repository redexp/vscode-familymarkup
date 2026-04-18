import type {G, Rect as SvgRect, Text, Circle, Line, Element} from '@svgdotjs/svg.js';
import {animate, type JSAnimation} from 'animejs';
import type {Dir, Loc, Pos, Rect, SvgPerson} from "../types";
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

		const posMap = getEndPos(pointers);

		for (let i = 0; i < pointers.length; i++) {
			const p = pointers[i];
			const {c, line, label, end} = p;
			const start = posMap.get(p);
			let ani = p.ani;

			if (!ani) {
				ani = new Map<any, JSAnimation>();
				p.ani = ani;
			}

			if (!ani.has(c)) {
				const a = animate(c.node, {
					cx: start.x,
					cy: start.y,
					duration: 300,
					autoplay: false,
				});

				ani.set(c, a);
			}

			if (!ani.has(line)) {
				const a = animate(line.node, {
					x1: start.x,
					y1: start.y,
					x2: end.x,
					y2: end.y,
					duration: 300,
					autoplay: false,
				});

				ani.set(line, a);

				if (p.dir) {
					const aDir = animate(line.node, {
						strokeDashoffset: [0, 16 * p.dir],
						ease: 'linear',
						loop: true,
						autoplay: false,
						onPause() {
							line.stroke({
								dasharray: '4'
							});
						},
					});

					ani.set('dir', aDir);
				}
			}

			if (p.dir) {
				line.stroke({
					dasharray: '8'
				});
			}

			if (label) {
				label.front().addClass('active');

				if (!ani.has(label)) {
					const a = animate(label.node, {
						translateX: [
							p.start.x - R - (p.side === 1 ? 0 : p.width - DIAMETER),
							p.start.x - R - (p.side === 1 ? 0 : p.width - DIAMETER),
						],
						translateY: [
							p.start.y - R,
							start.y - R,
						],
						opacity: 1,
						duration: 300,
						autoplay: false,
					});

					ani.set(label, a);
				}
			}

			for (const a of ani.values()) {
				a.play();
			}
		}
	};

	onMouseLeave = () => {
		const {pointers} = this;

		if (pointers.length === 0 || !this.isOver) return;

		this.isOver = false;

		for (const p of pointers) {
			const {start, line, label, ani} = p;

			line.attr({
				x1: start.x,
				y1: start.y,
			});

			if (label) {
				label.removeClass('active');
			}

			for (const [key, a] of ani) {
				if (key === 'dir') {
					a.pause();
				}
				else {
					a.reverse();
				}
			}
		}
	};
}

export type Pointer = {
	c: Circle,
	label?: G,
	width?: number,
	side: Dir,
	line: Line,
	start: Pos,
	cut: Pos,
	end: Pos,
	dir?: Dir,
	ani?: Map<any, JSAnimation>,
};

function getEndPos(pointers: Pointer[]): Map<Pointer, Pos> {
	const map = new Map<Pointer, Pos>();

	if (pointers.length === 0) return map;

	const start = pointers[0].start;

	const groups: [Pointer[], Pointer[]] = [
		[], []
	];

	for (const p of pointers) {
		groups[p.side === -1 ? 0 : 1].push(p);
	}

	for (const list of groups) {
		if (list.length === 0) continue;

		list.sort((a, b) => a.cut.y - b.cut.y);

		const totalHeight = list.length * DIAMETER;

		let top = start.y - totalHeight / 2;

		for (const p of list) {
			let x = p.start.x;

			if (p.width && list.length > 1) {
				x += (p.width - DIAMETER) * p.side;
			}

			const y = top + DIAMETER / 2;

			top += DIAMETER;

			map.set(p, {x, y});
		}
	}

	return map;
}

function stopAnimation(el: Element) {
	const r = el.animate();

	if (r.active()) {
		r.unschedule();
	}
}