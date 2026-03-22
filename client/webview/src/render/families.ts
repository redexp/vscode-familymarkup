import type {SvgFamily} from "../types";
import {createBoundingPath} from "../lib/tree";
import {open} from "../lib/api";
import {MAIN_COLOR} from '../theme';
import renderText from './text';
import renderPerson from './person';
import {families as container, clearAll} from '../app';

export default function renderFamilies(families: SvgFamily[]) {
	clearAll();

	for (const family of families) {
		const fg = container.group();
		fg.addClass('family');
		fg.translate(family.x, family.y);

		const path = createBoundingPath(family);

		const bounding = fg.path(path.path);
		bounding.addClass('bounding');
		bounding.fill('#fafdff');
		bounding.stroke({
			color: MAIN_COLOR,
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