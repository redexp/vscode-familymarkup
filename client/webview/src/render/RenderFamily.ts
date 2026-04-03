import type {Text as SvgText, G as SvgGroup, Line} from '@svgdotjs/svg.js';
import type {Loc, Rect, SvgFamily, SvgPerson} from "../types";
import {RenderPerson} from './RenderPerson.ts';
import toRect from "../lib/toRect";
import loc2key from "../lib/loc2key";
import {themeColors} from "../theme.ts";
import {applyFontStyle} from "./text.ts";

export class RenderFamily {
	uri: string;
	group: SvgGroup;
	rect: Rect;
	loc: Loc;
	title: {
		node: SvgText,
		rect: Rect,
		underline: Line,
	};

	persons = new Map<string, RenderPerson>();

	constructor(f: SvgFamily, fg: SvgGroup, title: SvgText) {
		this.uri = f.uri;
		this.group = fg;
		this.rect = toRect(f);
		this.loc = f.loc;
		this.title = {
			node: title,
			rect: toRect(f.title, f),
			underline: title.prev() as Line,
		};

		this.updateThemeColors();
	}

	addPerson(p: SvgPerson, pg: SvgGroup): RenderPerson {
		const rp = new RenderPerson(this, p, pg);
		this.persons.set(loc2key(rp.loc), rp);
		return rp;
	}

	updateThemeColors() {
		applyFontStyle(this.title.node, themeColors.family);

		this.title.underline
		.stroke({
			color: themeColors.family.foreground
		})
		.css('display', (
			!themeColors.family.fontStyle?.includes('underline') ?
				'none' :
				null
		));

		for (const p of this.persons.values()) {
			p.updateThemeColors();
		}
	}
}

