import type {Selection} from "vscode";
import type {Docs} from "../types";
import {showRect} from '../lib/moveView';
import {RenderFamily} from "../render/RenderFamily.ts";

export default function selectionHandler(docs: Docs, uri: string, selections: Selection[]) {
	const doc = docs.get(uri);

	if (!doc) return;

	for (const s of selections) {
		const item = doc.byRange(s);

		if (item) {
			if (item instanceof RenderFamily) {
				showRect(item.title.rect);
			}
			else {
				showRect(item.rect);
			}
			return;
		}
	}
}