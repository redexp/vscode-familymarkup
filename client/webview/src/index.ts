import './style/app.less';
import type {Docs} from "./types";
import {onEvent, send} from './lib/api';
import renderFamilies from './render/families';
import {getFontRatio} from './theme';
import selectionHandler from './controllers/selection';
import highlightsHandler from './controllers/highlights';

let docs: Docs;

onEvent((e) => {
	switch (e.type) {
	case 'families':
		docs = renderFamilies(e.families);
		break;

	case 'selection':
		console.log('selection', e.selections);
		selectionHandler(docs, e.uri, e.selections);
		break;

	case 'highlights':
		console.log('highlights', e.highlights);
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