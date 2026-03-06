import Two from 'two.js';
import panZoom from './lib/pan-zoom';
import type {SvgFamily, SvgPerson} from "./types";
import type {Group} from 'two.js/src/group';
import {createBoundingPath} from "./lib/tree";

let FONT_FAMILY: string;
const COLOR = '#4a90e2';

const root = new Two({
	type: Two.Types.svg,
	fullscreen: true,
	autostart: true,
});

root.appendTo(document.body);

const stage = new Two.Group();

root.add(stage);

panZoom(root, stage);

export function renderFamilies(families: SvgFamily[]) {
	for (const family of families) {
		const g = new Two.Group();
		g.position.set(family.x, family.y);

		const path = createBoundingPath(family);

		const bounding = new Two.Path(
			path.commands.map(p => {
				const v = p.values;

				return Two.Anchor.fromObject({
					x: v.x,
					y: v.y,
					rx: v.radiusX,
					ry: v.radiusY,
					xAxisRotation: v.rotation,
					largeArcFlag: v.largeArc,
					sweepFlag: v.sweep,
					command: p.marker,
				});
			}),
			false,
			false,
			true
		);
		bounding.fill = '#fafdff';
		bounding.stroke = COLOR;
		bounding.linewidth = 2;
		bounding.dashes = [4];

		const {title: t} = family;

		const title = new Two.Text(t.name, t.x + t.width/2, t.y + t.height/2, {
			family: FONT_FAMILY,
			size: 16,
		});

		title.className = 'family-title';

		g.add(bounding, title);

		for (const person of family.roots) {
			renderPerson(g, person);
		}

		stage.add(g);
	}

	root.update();
}

function renderPerson(g: Group, p: SvgPerson) {
	const rect = toRect(p);
	rect.className = 'person';
	rect.stroke = COLOR;
	rect.linewidth = 2;

	const name = new Two.Text(p.name, p.x + p.width/2, p.y + p.height/2, {
		family: FONT_FAMILY,
		size: 12,
	});

	name.className = 'person-name';

	for (const child of p.children) {
		const arrow = bezier(p, child);
		arrow.fill = 'none'
		arrow.stroke = COLOR;
		arrow.linewidth = 2;

		g.add(arrow);

		renderPerson(g, child);
	}

	g.add(rect, name);
}

function toRect(p: SvgPerson) {
	const {x, y, width: w, height: h} = p;

	return new Two.RoundedRectangle(x + w/2, y + h/2, w, h, 6);
}

export function getFontRatio() {
	const data = JSON.parse(document.getElementById('data').innerHTML);

	FONT_FAMILY = data.fontFamily;

	document.body.style.fontFamily = FONT_FAMILY;

	const ctx = document.createElement('canvas').getContext('2d');
	const size = 12;

	ctx.font = size + `px ` + FONT_FAMILY;
	const {width} = ctx.measureText('X');

	return width / size;
}

function bezier(from: SvgPerson, to: SvgPerson) {
	const a = {
		x: from.x + from.width / 2,
		y: from.y + from.height / 2,
	};

	const d = {
		x: to.x + to.width / 2,
		y: to.y + to.height / 2,
	};

	const height = to.y - from.y;

	const b = {
		x: 0,
		y: height * 0.75,
	};

	const c = {
		x: 0,
		y: -height * 0.75,
	};

	return new Two.Path([
		Two.Anchor.fromObject({
			...a,
			controls: {
				right: b,
			},
			command: 'M',
		}),
		Two.Anchor.fromObject({
			...d,
			controls: {
				left: c,
			},
			command: 'C',
		}),
	], false, false, true);
}