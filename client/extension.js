const createLsp = require('./lsp-node');
const init = require('./init');

let lsp;

/**
 * @typedef {{ext: import('vscode').ExtensionContext, lsp: import('vscode-languageclient').LanguageClient}} Ctx
 */

/**
 * @param {import('vscode').ExtensionContext} ext
 */
exports.activate = async function (ext) {
	lsp = createLsp(ext);

	await init(ext, lsp);
};

exports.deactivate = function () {
	if (lsp) {
		return lsp.stop();
	}
};
