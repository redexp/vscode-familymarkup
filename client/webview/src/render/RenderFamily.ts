import type {Text as SvgText, G as SvgGroup} from '@svgdotjs/svg.js';
import type {Loc, Rect, SvgFamily, SvgPerson} from "../types";
import toRect from "../lib/toRect";
import loc2key from "../lib/loc2key";

export class RenderFamily {
	uri: string;
	group: SvgGroup;
	rect: Rect;
	loc: Loc;
	title: {
		node: SvgText,
		rect: Rect,
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
		};
	}

	addPerson(p: SvgPerson, pg: SvgGroup): RenderPerson {
		const rp = new RenderPerson(this, p, pg);
		this.persons.set(loc2key(rp.loc), rp);
		return rp;
	}
}

export class RenderPerson {
	rect: Rect;
	loc: Loc;
	group: SvgGroup;

	constructor(f: RenderFamily, p: SvgPerson, pg: SvgGroup) {
		this.loc = p.loc;
		this.group = pg;
		this.rect = toRect(p, f.rect);
	}
}

