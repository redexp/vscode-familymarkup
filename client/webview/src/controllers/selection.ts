import type {Selection} from "vscode";
import type {Docs} from "../render/Docs";
import {showItem} from '../lib/viewport.ts';

export default function selectionHandler(docs: Docs, uri: string, selections: Selection[]) {
	const doc = docs.get(uri);

	if (!doc) return;

	for (const s of selections) {
		const item = doc.byRange(s);

		if (item) {
			showItem(item);
			return;
		}
	}
}