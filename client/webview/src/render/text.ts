import type {G, Text} from '@svgdotjs/svg.js';
import type {Rect} from "../types";
import {type ThemeStyle} from "../theme.ts";

export default function renderText(g: G, text: string, size: number, rect: Rect) {
	const t = g.plain(text);
	t.amove(rect.x + rect.width/2, rect.y + rect.height/2);
	t.css({
		"font-size": size + "px",
		"text-anchor": "middle",
		"alignment-baseline": "middle",
	});

	return t;
}

export function applyFontStyle(node: Text, style: ThemeStyle) {
	node.fill(style.foreground);
	node.css({
		'font-weight': style.fontStyle?.includes('bold') ? 'bold' : null,
	});
}