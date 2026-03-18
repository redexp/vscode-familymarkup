import type {G} from '@svgdotjs/svg.js';
import type {Rect} from "../types";
import {FONT_FAMILY} from '../theme';

export default function renderText(g: G, text: string, size: number, rect: Rect) {
	const t = g.plain(text);
	t.amove(rect.x + rect.width/2, rect.y + rect.height/2);
	t.css({
		"font-family": FONT_FAMILY,
		"font-size": size + "px",
		"text-anchor": "middle",
		"alignment-baseline": "middle",
	});

	return t;
}