import type {RenderFamily, RenderPerson} from "./RenderFamily";
import loc2key, {range2key} from "../lib/loc2key";
import type {Range} from "vscode";
import type {Loc} from "../types";

export class Doc {
	map = new Map<string, RenderFamily|RenderPerson>();
	families: RenderFamily[] = [];
	
	addFamily(rf: RenderFamily) {
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

	byLoc(loc: Loc) {
		return this.get(loc2key(loc));
	}
}