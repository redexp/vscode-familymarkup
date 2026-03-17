// @ts-ignore
import svgPanZoom from 'svg-pan-zoom';
import {SVG, type G} from '@svgdotjs/svg.js';
import type {Rect, SvgFamily, SvgPerson} from "./types";
import {createBoundingPath} from "./lib/tree";
import {open} from "./lib/api";

let FONT_FAMILY: string;
const COLOR = '#4a90e2';

const root = SVG().addTo(document.body);
const stage = root.group().addClass('svg-pan-zoom_viewport');

resize();
svgPanZoom(root.node, {
	minZoom: 0.1,
	maxZoom: 10,
	zoomScaleSensitivity: 0.3,
	dblClickZoomEnabled: false,
});

window.addEventListener('resize', resize);

export function renderFamilies(families: SvgFamily[]) {
	stage.clear();

	for (const family of families) {
		const fg = stage.group();
		fg.translate(family.x, family.y);

		const path = createBoundingPath(family);

		const bounding = fg.path(path.path);
		bounding.fill('#fafdff');
		bounding.stroke({
			color: COLOR,
			width: 2,
			dasharray: '4',
		});

		const {title: t} = family;

		const title = createText(fg, t.name, 16, t);
		title.addClass('family-title');
		title.on('click', function () {
			open(family.uri, family.loc);
		});

		for (const person of family.roots) {
			renderPerson(fg, family, person);
		}
	}
}

function renderPerson(fg: G, f: SvgFamily, p: SvgPerson) {
	for (const child of p.children) {
		const arrow = createArrow(fg, p, child);
		arrow.fill('none');
		arrow.stroke({color: COLOR, width: 2});
	}

	const pg = fg.group();
	pg.translate(p.x, p.y);
	pg.addClass('person');

	pg.on('click', function () {
		open(f.uri, p.loc);
	});

	const rect = pg.rect(p.width, p.height);
	rect.radius(6);
	rect.fill('#fff');
	rect.stroke({color: COLOR, width: 2});

	createText(pg, p.name, 12, {
		x: 0,
		y: 0,
		width: p.width,
		height: p.height,
	});

	for (const child of p.children) {
		renderPerson(fg, f, child);
	}
}

function resize() {
	const w = window.innerWidth;
	const h = window.innerHeight;

	root.size(w, h);
	root.viewbox(0, 0, w, h);
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

function createArrow(g: G, from: SvgPerson, to: SvgPerson) {
	const a = {
		x: from.x + from.width / 2,
		y: from.y + from.height / 2,
	};

	const d = {
		x: to.x + to.width / 2,
		y: to.y + to.height / 2,
	};

	const h = (to.y - from.y) * 0.75;

	const b = {
		x: a.x,
		y: a.y + h,
	};

	const c = {
		x: d.x,
		y: d.y - h,
	};

	return g.path([['M', a.x, a.y], ['C', b.x, b.y, c.x, c.y, d.x, d.y]]);
}

function createText(g: G, text: string, size: number, rect: Rect) {
	const t = g.plain(text);
	t.amove(rect.x + rect.width/2, rect.y + rect.height/2);
	t.css({
		"font-family": FONT_FAMILY,
		"font-size": size + "px",
		"text-anchor": "middle",
		"alignment-baseline": "middle",
	});

	return t;
}