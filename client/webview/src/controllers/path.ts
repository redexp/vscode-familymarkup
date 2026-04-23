import type {G} from "@svgdotjs/svg.js";
import type {Pos, SvgPathPerson} from "../types";
import type {Docs} from "../render/Docs.ts";
import type {RenderPerson} from "../render/RenderPerson.ts";
import {getZoomStep, type ZoomStep} from "./zoomStep.ts";
import type {Circle, Line} from "@svgdotjs/svg.js";
import {pos2key} from '../lib/loc2key.ts';
import {root, stage, paths as container} from '../app.ts';
import {getLine, getLineEnd} from '../render/pointers.ts';
import {POINTER_COLOR, POINTER_DIAMETER} from "../theme.ts";
import {animate, type JSAnimation} from "animejs";
import {moveView} from "../lib/viewport.ts";

const closeMarker = root.marker(10, 10, function(add) {
	add
	.circle(POINTER_DIAMETER)
	.fill(POINTER_COLOR);

	add
	.path([['M', 2, 2], ['L', 8, 8], ['M', 2, 8], ['L', 8, 2]])
	.stroke({
		width: 1.5,
		color: 'white',
	});

	const c = POINTER_DIAMETER/2;

	this
	.ref(c, c)
	.orient(0)
	.attr('markerUnits', 'userSpaceOnUse');
});

const paths = new Set<SvgPath>();

const zoomMap = new Map<ZoomStep, {width: number, dasharray: number}>([
	['normal', {
		width: 2,
		dasharray: 8,
	}],
	['sm', {
		width: 4,
		dasharray: 16,
	}],
	['xs', {
		width: 8,
		dasharray: 20,
	}],
	['min', {
		width: 14,
		dasharray: 40,
	}],
]);

export default function pathHandler(docs: Docs, path: SvgPathPerson[]) {
	const persons: RenderPerson[] = path.map(item => {
		const doc = docs.get(item.uri);
		return doc.get(pos2key(item.position)) as RenderPerson;
	});

	requestAnimationFrame(function () {
		stage.addClass('has-path');

		const path: SvgPath = {
			group: container.group(),
			items: [],
		};

		paths.add(path);

		path.group.addClass('path');

		for (let i = 0; i < persons.length - 1; i++) {
			const item = renderPathItem(
				path,
				persons[i],
				persons[i + 1],
				i + 2 === persons.length
			);

			path.items.push(item);
		}

		alignDots();
	});
}

stage.on('zoom-step', function () {
	requestAnimationFrame(function () {
		for (const path of paths) {
			for (const item of path.items) {
				updatePathItemSize(item);
			}
		}
	});
});

function renderPathItem(path: SvgPath, p: RenderPerson, target: RenderPerson, last: boolean): SvgPathItem {
	const {group} = path;
	const {start, end} = getLine(p.rect, target.rect);

	const move = function (e: Event) {
		e.stopPropagation();
		moveView(start, end);
	};

	const line = group.line(start.x, start.y, end.x, end.y);
	line.addClass('pointer');
	line.stroke({
		color: POINTER_COLOR,
	});
	line.on('click', move);

	const cStart = group.circle(POINTER_DIAMETER);
	cStart.addClass('pointer');
	cStart.center(start.x, start.y);
	cStart.fill(POINTER_COLOR);
	cStart.on('click', move);

	const cEnd = group.circle(POINTER_DIAMETER);
	cEnd.addClass('pointer');
	cEnd.center(end.x, end.y);
	cEnd.fill(POINTER_COLOR);

	if (last) {
		line.marker('end', closeMarker);
		cEnd.css('opacity', '0.1');
		cEnd.on('click', function (e) {
			e.stopPropagation();
			destroyPath(path);
		});
	}
	else {
		cEnd.on('click', function (e) {
			e.stopPropagation();
			moveView(end, start);
		});
	}

	const item: SvgPathItem = {
		line,
		dots: [cStart, cEnd],
		persons: [p, target],
		range: [start, end],
	};

	updatePathItemSize(item);

	return item;
}

function updatePathItemSize(item: SvgPathItem) {
	const {width, dasharray} = zoomMap.get(getZoomStep());

	item.line.stroke({
		width,
		dasharray: String(dasharray),
	});

	if (item.ani) {
		item.ani.cancel();
	}

	item.ani = animate(item.line.node, {
		strokeDashoffset: [0, dasharray * -2],
		ease: 'linear',
		loop: true,
	});
}

function alignDots() {
	const map = new Map<string, {pos: Pos, list: Array<{side: number, end: Pos, item: SvgPathItem}>}>();

	for (const path of paths) {
		for (const item of path.items) {
			for (let side = 0; side < 2; side++) {
				const pos = item.range[side];
				const end = item.range[side === 0 ? 1 : 0];
				const key = pos.x + ':' + pos.y;

				if (!map.has(key)) {
					map.set(key, {pos, list: []});
				}

				map.get(key).list.push({side, end, item});
			}
		}
	}

	for (const {pos, list} of map.values()) {
		if (list.length <= 1) continue;

		list.sort(function (a, b) {
			const cut1 = getLineEnd(pos, a.end, 20);
			const cut2 = getLineEnd(pos, b.end, 20);

			return cut1.y - cut2.y;
		});

		let top = pos.y - list.length * POINTER_DIAMETER / 2 + POINTER_DIAMETER/2;

		for (const {side, item} of list) {
			item.dots[side].cy(top);
			item.line.attr('y' + (side + 1), top);

			top += POINTER_DIAMETER;
		}
	}
}

function destroyPath(path: SvgPath) {
	for (const item of path.items) {
		if (item.ani) {
			item.ani.cancel();
		}
	}

	path.group.remove();

	paths.delete(path);
}

export type SvgPath = {
	group: G,
	items: SvgPathItem[],
};

export type SvgPathItem = {
	persons: [RenderPerson, RenderPerson],
	range: [Pos, Pos],
	line: Line,
	dots: [Circle, Circle],
	ani?: JSAnimation,
};