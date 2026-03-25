import type {Rect} from "../types";

export default function toRect(data: any): Rect {
	return {
		x: data.x,
		y: data.y,
		width: data.width,
		height: data.height,
	};
}