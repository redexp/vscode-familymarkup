import type {Docs} from "./Docs.ts";
import type {SvgRelation} from "../types";
import renderPointers from "./pointers.ts";

export default function renderRelation(docs: Docs, rel: SvgRelation) {
	const {sources, targets = [], label} = rel;

	if (sources.length > 1 && targets.length === 0) {
		for (const a of sources) {
			const from = docs.getPerson(a);

			for (const b of sources) {
				if (a === b) continue;

				const to = docs.getPerson(b);

				renderPointers(from, [{
					...to.rect,
					label,
					relation: 1,
				}]);
			}
		}

		return;
	}

	for (const rect of sources) {
		const from = docs.getPerson(rect);

		for (const rect of targets) {
			const to = docs.getPerson(rect);

			renderPointers(from, [{
				...to.rect,
				label,
				relation: -1,
			}]);
		}
	}

	for (const rect of targets) {
		const from = docs.getPerson(rect);

		for (const rect of sources) {
			const to = docs.getPerson(rect);

			renderPointers(from, [{
				...to.rect,
				label,
				relation: 1,
			}]);
		}
	}
}