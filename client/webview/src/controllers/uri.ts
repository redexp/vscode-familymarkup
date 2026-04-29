import type {Range} from "vscode";
import type {Docs} from "../render/Docs.ts";
import {showItem, showRect} from '../lib/viewport.ts';

export default function uriHandler(docs: Docs, uri: string, selection?: Range) {
	const doc = docs.get(uri);

	if (!doc) return;

	const item = selection && doc.byRange(selection);

	if (item) {
		showItem(item);
		item.group.addClass('highlight');
	}
	else {
		showRect(doc.families[0].title.rect);
	}
}