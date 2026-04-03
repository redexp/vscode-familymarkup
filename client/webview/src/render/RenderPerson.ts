import type {G as SvgGroup, Rect as SvgRect, Text} from '@svgdotjs/svg.js';
import type {Loc, Rect, SvgPerson} from "../types";
import type {RenderFamily} from './RenderFamily.ts';
import toRect from "../lib/toRect.ts";
import {themeColors} from "../theme.ts";
import {applyFontStyle} from "./text.ts";

export class RenderPerson {
	rect: Rect;
	loc: Loc;
	group: SvgGroup;
	unknown = false;
	bg: SvgRect;
	name: {
		node: Text,
	};

	constructor(f: RenderFamily, p: SvgPerson, pg: SvgGroup) {
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
	}
}