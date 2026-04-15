import './style/app.less';
import type {Docs} from "./render/Docs.ts";
import {onEvent, send} from './lib/api';
import renderFamilies from './render/families';
import {getFontRatio, setThemeColors, updateThemeFont} from './theme';
import uriHandler from './controllers/uri';
import selectionHandler from './controllers/selection';
import highlightsHandler from './controllers/highlights';

let docs: Docs;

onEvent((e) => {
	switch (e.type) {
	case 'families':
		docs = renderFamilies(e.families, e.relations);
		break;

	case 'theme':
		updateThemeFont();
		setThemeColors(e.colors);

		if (docs) {
			requestAnimationFrame(function () {
				docs.updateThemeColors();
			});
		}
		break;

	case 'uri':
		uriHandler(docs, e.uri, e.selection);
		break;

	case 'selection':
		selectionHandler(docs, e.uri, e.selections);
		break;

	case 'highlights':
		highlightsHandler(docs, e.uri, e.highlights);
		break;
	}
});

send('ready', {
	fontRatio: getFontRatio(),
})
.catch(err => {
	console.error('send(ready)', err)
});