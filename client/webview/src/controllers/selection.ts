import type {Selection} from "vscode";
import type {Docs} from "../types";
import {showItem} from '../lib/moveView';

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