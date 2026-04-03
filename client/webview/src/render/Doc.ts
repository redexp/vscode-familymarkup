import type {Range} from "vscode";
import type {RenderFamily} from "./RenderFamily";
import type {RenderPerson} from "./RenderPerson.ts";
import loc2key, {range2key} from "../lib/loc2key";

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