import type {Docs} from "./Docs.ts";
import type {SvgRelation} from "../types";
import renderPointers from "./pointers.ts";

export default function renderRelation(docs: Docs, rel: SvgRelation) {
	const {sources, targets = []} = rel;

	if (sources.length === 2 && targets.length === 0) {
		const a = docs.getPerson(sources[0]);
		const b = docs.getPerson(sources[1]);

		for (const [from, to] of [[a, b], [b, a]]) {
			renderPointers(from, [{
				...to.rect,
				label: rel.label,
				isRelation: true,
			}]);
		}

		return;
	}
}