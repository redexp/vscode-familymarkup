import type {Loc} from "../types";
import type {Range, Position} from "vscode";

export default function loc2key(loc: Loc): string {
	return loc.start.line + ':' + loc.start.char;
}

export function range2key(range: Range | [Position, Position]): string {
	const start = Array.isArray(range) ? range[0] : range.start;

	return pos2key(start);
}

export function pos2key(pos: Position): string {
	return pos.line + ':' + pos.character;
}