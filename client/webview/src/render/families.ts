import type {G} from '@svgdotjs/svg.js';
import type {SvgFamily} from "../types";
import {createBoundingPath} from "../lib/tree";
import {open} from "../lib/api";
import {COLOR} from '../theme';
import renderText from './text';
import renderPerson from './person';

export default function renderFamilies(stage: G, families: SvgFamily[]) {
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

		const title = renderText(fg, t.name, 16, t);
		title.addClass('family-title');
		title.on('click', function () {
			open(family.uri, family.loc);
		});

		for (const person of family.roots) {
			renderPerson(fg, family, person);
		}
	}
}