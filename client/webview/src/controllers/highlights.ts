import type {Docs} from "../types";
import type {DocumentHighlight} from "vscode";
import {root} from '../app.ts';

export default function highlightsHandler(docs: Docs, uri: string, list: DocumentHighlight[]) {
	const doc = docs.get(uri);

	if (!doc) return;

	requestAnimationFrame(function () {
		const cl = 'highlight';

		root.node.querySelectorAll('.' + cl).forEach(function (el) {
			el.classList.remove(cl);
		})

		for (const {range} of list) {
			const item = doc.byRange(range);

			if (item) {
				item.group.addClass(cl);
			}
		}
	});
}