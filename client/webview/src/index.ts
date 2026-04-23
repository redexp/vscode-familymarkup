import './style/app.less';
import type {Docs} from "./render/Docs.ts";
import {onEvent, send} from './lib/api';
import renderFamilies from './render/families';
import {getFontRatio, setThemeColors, updateThemeFont} from './theme';
import uriHandler from './controllers/uri';
import selectionHandler from './controllers/selection';
import highlightsHandler from './controllers/highlights';
import pathHandler from './controllers/path.ts';

let docs: Docs;

onEvent((e) => {
	switch (e.type) {
	case 'families':
		docs = renderFamilies(e.families, e.relations);

		for (const cb of pendingForDocs) {
			cb(docs);
		}
		return;

	case 'theme':
		updateThemeFont();
		setThemeColors(e.colors);

		if (docs) {
			requestAnimationFrame(function () {
				docs.updateThemeColors();
			});
		}
		return;
	}

	onDocs(function (docs) {
		switch (e.type) {
		case 'uri':
			uriHandler(docs, e.uri, e.selection);
			break;

		case 'selection':
			selectionHandler(docs, e.uri, e.selections);
			break;

		case 'highlights':
			highlightsHandler(docs, e.uri, e.highlights);
			break;

		case 'path':
			pathHandler(docs, e.path);
			break;
		}
	})
});

const pendingForDocs: Array<(docs: Docs) => void> = [];

function onDocs(cb: (docs: Docs) => void) {
	if (docs) {
		cb(docs);
		return;
	}

	pendingForDocs.push(cb);
}

send('ready', {
	fontRatio: getFontRatio(),
})
.catch(err => {
	console.error('send(ready)', err)
});