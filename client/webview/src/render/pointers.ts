import type {Dir, Pos, SvgPersonLink} from "../types";
import type {RenderPerson} from "./RenderPerson.ts";
import type {G} from "@svgdotjs/svg.js";
import {POINTER_COLOR, textWidth, themeColors} from '../theme';
import {pointers as container} from '../app';
import moveView from '../lib/moveView';

const DIAMETER = 10;
const R = DIAMETER / 2;
const LABEL_SIZE = DIAMETER - 2;

export default function renderPointers(rp: RenderPerson, links?: SvgPersonLink[]) {
	if (!links || links.length === 0) return;

	const root = rp.rect;

	const base = {
		x: root.x,
		y: root.y + root.height / 2,
	};

	for (const {label, ...target} of links) {
		const start = {...base};

		const end = {
			x: target.x,
			y: target.y + target.height / 2,
		};

		let min = Number.MAX_VALUE;
		let side = -1;

		for (const [si, s, e] of [
			[-1, start.x + 10, end.x + 10],
			[-1, start.x + 10, end.x + target.width - 10],
			[1, start.x + root.width - 10, end.x + 10],
			[1, start.x + root.width - 10, end.x + target.width - 10],
		]) {
			const v = Math.abs(s - e);
			if (v >= min) continue;
			min = v;
			side = si;
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

		if (target.relation) {
			line.stroke({
				dasharray: '4'
			});
		}

		const c = container.circle(DIAMETER);
		c.addClass('pointer');
		c.center(start.x, start.y);
		c.fill(POINTER_COLOR);

		const click = (e: Event) => {
			e.stopPropagation();
			moveView(start, end);
		};

		let lg: G;
		let lw: number;

		if (label) {
			const width = textWidth(label, LABEL_SIZE);
			lw = width + 8;

			lg = container.group();
			lg.addClass('pointer-label');
			lg.css('opacity', '0');
			lg.on('mouseenter', rp.onMouseEnter);
			lg.on('mouseleave', rp.onMouseLeave);

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

			lg.on('mouseenter', rp.onMouseEnter);
			lg.on('mouseleave', rp.onMouseLeave);
			lg.on('click', click);
		} else {
			c.on('mouseenter', rp.onMouseEnter);
			c.on('mouseleave', rp.onMouseLeave);
			c.on('click', click);
		}

		rp.pointers.push({
			side: side as Dir,
			c,
			line,
			label: lg,
			width: lw,
			start,
			cut,
			end,
			dir: target.relation,
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