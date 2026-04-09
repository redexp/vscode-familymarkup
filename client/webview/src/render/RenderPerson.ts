import type {G, Rect as SvgRect, Text, Circle, Line} from '@svgdotjs/svg.js';
import type {Loc, Pos, Rect, SvgPerson} from "../types";
import type {RenderFamily} from './RenderFamily.ts';
import toRect from "../lib/toRect.ts";
import {themeColors} from "../theme.ts";
import {applyFontStyle} from "./text.ts";

export class RenderPerson {
	rect: Rect;
	loc: Loc;
	group: G;
	unknown = false;
	bg: SvgRect;
	name: {
		node: Text,
	};
	pointers: Pointer[];

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
}

export type Pointer = {
	c: Circle,
	line: Line,
	label?: G,
	width?: number,
	side: -1 | 1,
	start: Pos,
	cut: Pos,
	end: Pos,
};