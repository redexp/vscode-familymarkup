import type {Pos, Rect} from "../types";

export default function toRect(data: any, relPos?: Pos): Rect {
	const x = relPos?.x || 0;
	const y = relPos?.y || 0;

	return {
		x: data.x + x,
		y: data.y + y,
		width: data.width,
		height: data.height,
	};
}