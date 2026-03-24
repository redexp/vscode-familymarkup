import './style.less';
import type {Rect, SvgFamily, SvgPerson} from "./types";
import type {Selection} from "vscode";
import {onEvent, send} from './lib/api';
import {showRect} from './lib/moveView';
import renderFamilies from './render/families';
import {getFontRatio} from './theme';

const docs = new Map<string, {loc2rect: Map<string, Rect>}>();

onEvent((e) => {
	switch (e.type) {
	case 'families':
		renderFamilies(e.families);
		updateDocs(e.families);
		break;

	case 'selection':
		const uri = e.uri as string;
		const doc = docs.get(uri);

		if (!doc) return;

		for (const s of e.selections as Selection[]) {
			const rect = doc.loc2rect.get(s.start.line + ':' + s.start.character);

			if (rect) {
				showRect(rect);
				break;
			}

		}
		break;

	case 'highlights':
		console.log(e.highlights);
		break;
	}
});

send('ready', {
	fontRatio: getFontRatio(),
})
.catch(err => {
	console.error('send(ready)', err)
});

function updateDocs(list: SvgFamily[]) {
	docs.clear();

	for (const f of list) {
		if (!docs.has(f.uri)) {
			docs.set(f.uri, {
				loc2rect: new Map(),
			});
		}

		const {loc2rect} = docs.get(f.uri);

		mergePersons(f, f.roots, loc2rect);
	}
}

function mergePersons(f: SvgFamily, list: SvgPerson[], map: Map<string, Rect>) {
	for (const p of list) {
		const {start: s} = p.loc;

		map.set(s.line + ":" + s.char, {
			x: f.x + p.x,
			y: f.y + p.y,
			width: p.width,
			height: p.height,
		});

		if (p.children?.length > 0) {
			mergePersons(f, p.children, map);
		}
	}
}