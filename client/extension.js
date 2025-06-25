// const {join} = require('path');
const {initClient} = require('./lsp');
// const highlight = require('./highlight');

let client;

/**
 * @param {import('vscode').ExtensionContext} ctx 
 */
exports.activate = async function (ctx) {
	await Promise.all([
		initClient(ctx).then(c => (client = c)),
		// highlight.init({
		// 	locateFamilyMarkupWasm(name) {
		// 		return ctx.asAbsolutePath(join('node_modules', 'highlight-familymarkup', name));
		// 	}
		// }),
	]);

	// return {
	// 	extendMarkdownIt(md) {
	// 		return md.use(highlight);
	// 	}
	// };
};

exports.deactivate = function () {
	if (client) {
		return client.stop();
	}
};
