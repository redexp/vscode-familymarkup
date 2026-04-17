import type {Pointer} from "../render/RenderPerson.ts";
import type {Pos} from "../types";

export function tan(p: Pointer) {
	let a = atan2(p.start, p.end);

	if (a > Math.PI / 2) {
		a = Math.PI - a
	}

	return a;
}

export function atan2(start: Pos, end: Pos) {
	const dx = end.x - start.x;
	const dy = end.y - start.y;

	return Math.atan2(dy, dx);
}