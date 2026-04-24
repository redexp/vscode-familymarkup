import type {Pos, Rect} from "../types";
import {zoom, root} from '../app';
import {RenderFamily} from "../render/RenderFamily.ts";
import type {RenderPerson} from "../render/RenderPerson.ts";

export function moveView(start: Pos, end?: Pos) {
	const p = zoom.getTransform();
	const z = p.scale;
	const x = (start.x - end.x) * z;
	const y = (start.y - end.y) * z;

	zoom.smoothMoveTo(p.x + x, p.y + y);
}

export function showRect(rect: Rect) {
	const {scale: currentZoom} = zoom.getTransform();

	const centerX = rect.x + (rect.width / 2);
	const centerY = rect.y + (rect.height / 2);

	const newPanX = (Number(root.width()) / 2) - (centerX * currentZoom);
	const newPanY = (Number(root.height()) / 2) - (centerY * currentZoom);

	zoom.moveTo(newPanX, newPanY);
}

export function showItem(item: RenderFamily | RenderPerson) {
	if (item instanceof RenderFamily) {
		showRect(item.title.rect);
	}
	else {
		showRect(item.rect);
	}
}