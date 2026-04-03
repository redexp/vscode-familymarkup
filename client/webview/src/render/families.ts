import type {Docs, SvgFamily} from "../types";
import {createBoundingPath} from "../lib/tree";
import {open} from "../lib/api";
import {themeColors} from '../theme';
import renderText from './text';
import renderPerson from './person';
import {families as container, clearAll} from '../app';
import {RenderFamily} from "./RenderFamily";
import {Doc} from "./Doc";

export default function renderFamilies(families: SvgFamily[]): Docs {
	clearAll();

	const docs: Docs = new Map();

	for (const f of families) {
		const fg = container.group();
		fg.addClass('family');
		fg.translate(f.x, f.y);

		const path = createBoundingPath(f);

		const bounding = fg.path(path.path);
		bounding.addClass('bounding');
		bounding.stroke({
			width: 2,
			dasharray: '4',
		});

		const {title: t} = f;

		const bgRect = fg.rect(t.width, t.height);
		bgRect.addClass('family-title-bg');
		bgRect.move(t.x, t.y);
		bgRect.fill('none');

		const uLine = fg.line(t.x, t.y + t.height, t.x + t.width, t.y + t.height);
		uLine.addClass('underline');

		const title = renderText(fg, t.name, 16, t);
		title.addClass('family-title');
		title.fill(themeColors.family.foreground);
		title.on('click', function () {
			open(rf.uri, rf.loc);
		});

		const rf = new RenderFamily(f, fg, title);

		for (const person of f.roots) {
			renderPerson(rf, person);
		}

		if (!docs.has(rf.uri)) {
			docs.set(rf.uri, new Doc());
		}

		docs.get(rf.uri).addFamily(rf);
	}

	return docs;
}