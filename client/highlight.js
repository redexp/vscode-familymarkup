let highlight;

module.exports = function (md) {
	const {fence} = md.renderer.rules;

	md.renderer.rules.fence = function (tokens, idx, options, env, self) {
		const token = tokens[idx];
		const lang = token.info.trim();

		if (lang !== 'fml' && lang !== 'family') return fence.apply(this, arguments);

		try {
			const {html} = highlight(token.content, {html: true, classPrefix: 'hljs-'});
			return `<pre class="hljs fml"><code>${html}</code></pre>`;
		}
		catch (error) {
			console.error('Ошибка подсветки синтаксиса:', error);
		}
	};
};

module.exports.init = async function (params) {
	const {default: hg, init} = await import('highlight-familymarkup/browser.mjs');
	await init(params);
	highlight = hg;
};