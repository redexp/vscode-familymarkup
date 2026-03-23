import type {Pos, Rect} from "../types";
import {Timeline, Runner} from '@svgdotjs/svg.js';
import {zoom} from '../app';

export default function moveView(start: Pos, end?: Pos) {
	const p = zoom.getPan();
	const z = zoom.getZoom();
	const x = (start.x - end.x) * z;
	const y = (start.y - end.y) * z;

	const r = new Runner(1000);
	r.during((d: number) => {
		d = ease(d);

		zoom.pan({
			x: p.x + x * d,
			y: p.y + y * d,
		});
	});

	const t = new Timeline();
	t.schedule(r);
	t.play();
}

function ease(pos: number) {
	return Math.pow((pos-1), 5) + 1;
}

export function showRect(rect: Rect) {
	const sizes = zoom.getSizes();
	const currentZoom = sizes.realZoom;

	const centerX = rect.x + (rect.width / 2);
	const centerY = rect.y + (rect.height / 2);

	const newPanX = (sizes.width / 2) - (centerX * currentZoom);
	const newPanY = (sizes.height / 2) - (centerY * currentZoom);

	zoom.pan({
		x: newPanX,
		y: newPanY,
	});
}