/**
 * @typedef {import('vscode-languageclient').DocumentHighlight} Highlight
 * @typedef {function(highlights: Highlight[])} HighlightsCb
 * @type {Set<HighlightsCb>}
 */
const highlightsCallbacks = new Set();

/** @type {import('vscode-languageclient').Middleware} */
const middleware = {
	async provideDocumentHighlights(doc, pos, token, next) {
		/** @type {Highlight[]} */
		const highlights = await next(doc, pos, token);

		for (const cb of highlightsCallbacks) {
			cb(highlights);
		}

		return highlights;
	}
};

exports.middleware = middleware;

/**
 * @param {function(highlights: Highlight[])} cb
 */
exports.onHighlights = function (cb) {
	highlightsCallbacks.add(cb);

	return function () {
		highlightsCallbacks.delete(cb);
	};
};