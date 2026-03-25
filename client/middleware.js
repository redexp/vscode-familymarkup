/**
 * @typedef {import('vscode-languageclient').DocumentHighlightKind} HighlightKind
 * @typedef {import('vscode-languageclient').Position} HighlightPos
 * @typedef {import('vscode-languageclient').DocumentHighlight} Highlight
 * @typedef {function(uri: string, highlights: Highlight[])} HighlightsCb
 */

/** @type {Set<HighlightsCb>} */
const highlightsCallbacks = new Set();

/** @type {import('vscode-languageclient').Middleware} */
const middleware = {
	async provideDocumentHighlights(doc, pos, token, next) {
		/** @type {Highlight[]} */
		const highlights = await next(doc, pos, token);

		if (highlightsCallbacks.size > 0) {
			const uri = doc.uri.toString(true);
			const list = highlights.map(h => ({
				...h,
				range: {
					start: h.range.start,
					end: h.range.end,
				},
			}));

			for (const cb of highlightsCallbacks) {
				cb(uri, list);
			}
		}

		return highlights;
	}
};

exports.middleware = middleware;

/**
 * @param {HighlightsCb} cb
 */
exports.onHighlights = function (cb) {
	highlightsCallbacks.add(cb);

	return function () {
		highlightsCallbacks.delete(cb);
	};
};