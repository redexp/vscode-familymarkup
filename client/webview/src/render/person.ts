import type {SvgPerson} from "../types";
import type {RenderFamily} from "./RenderFamily";
import {themeColors} from '../theme';
import {open} from '../lib/api';
import renderText from './text';
import renderPointers from './pointers';
import renderArrow from './arrow.ts';
import onClick from "../lib/onClick.ts";

export default function renderPerson(rf: RenderFamily, p: SvgPerson) {
	if (p.children) {
		for (const child of p.children) {
			renderArrow(rf.group, p, child);
		}
	}

	const pg = rf.group.group();
	pg.translate(p.x, p.y);
	pg.addClass('person');

	onClick(pg, function () {
		open(rf.uri, p.loc);
	});

	const rect = pg.rect(p.width, p.height);
	rect.radius(6);
	rect.stroke({
		width: 2,
	});

	if (p.unknown) {
		rect.stroke({
			color: themeColors.unknown.foreground,
			dasharray: '8 4',
		});
	}
	else if (p.external) {
		rect.stroke({
			dasharray: '8 2',
		});
	}

	renderText(pg, p.name, 12, {
		x: 0,
		y: 0,
		width: p.width,
		height: p.height,
	});

	const rp = rf.addPerson(p, pg);

	renderPointers(rp, p.links);

	if (p.children) {
		for (const child of p.children) {
			renderPerson(rf, child);
		}
	}
}