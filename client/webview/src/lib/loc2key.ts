import type {Loc} from "../types";
import type {Range} from "vscode";

export default function loc2key(loc: Loc): string {
	return loc.start.line + ':' + loc.start.char;
}

export function range2key(range: Range): string {
	return range.start.line + ':' + range.start.character;
}