import type {Range} from "vscode";
import type {Docs} from "../types";
import {showItem, showRect} from '../lib/moveView';

export default function uriHandler(docs: Docs, uri: string, selection?: Range) {
	const doc = docs.get(uri);

	if (!doc) return;

	const item = selection && doc.byRange(selection);

	if (item) {
		showItem(item);
	}
	else {
		showRect(doc.families[0].rect);
	}
}