import type {Range} from "vscode";
import type {Rect} from "../types";
import type {RenderFamily} from "./RenderFamily";
import type {RenderPerson} from "./RenderPerson.ts";
import loc2key, {range2key} from "../lib/loc2key";

export class Docs {
	map = new Map<string, Doc>();
	rectToPerson = new Map<string, RenderPerson>();

	get(uri: string) {
		return this.map.get(uri);
	}

	addFamily(rf: RenderFamily) {
		if (!this.map.has(rf.uri)) {
			this.map.set(rf.uri, new Doc());
		}

		this.map.get(rf.uri).addFamily(rf);

		for (const p of rf.persons.values()) {
			this.rectToPerson.set(p.rect.x + ':' + p.rect.y, p);
		}
	}

	getPerson(rect: Rect) {
		return this.rectToPerson.get(rect.x + ':' + rect.y);
	}

	updateThemeColors() {
		for (const doc of this.map.values()) {
			doc.updateThemeColors();
		}
	}
}

export class Doc {
	map = new Map<string, RenderFamily|RenderPerson>();
	families: RenderFamily[] = [];
	
	addFamily(rf: RenderFamily) {
		this.families.push(rf);
		this.families.sort((a, b) => a.loc.start.line - b.loc.start.line);

		this.map.set(loc2key(rf.loc), rf);

		for (const [key, rp] of rf.persons) {
			this.map.set(key, rp);
		}
	}

	get(key: string) {
		return this.map.get(key);
	}

	byRange(range: Range) {
		return this.get(range2key(range));
	}

	updateThemeColors() {
		for (const family of this.families) {
			family.updateThemeColors();
		}
	}
}