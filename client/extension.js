const createLsp = require('./lsp-node');
const createTreeView = require('./treeview/create');
const initWebView = require('./webview/init');

let lsp;

/**
 * @typedef {{ext: import('vscode').ExtensionContext, lsp: import('vscode-languageclient').LanguageClient}} Ctx
 */

/**
 * @param {import('vscode').ExtensionContext} ext
 */
exports.activate = async function (ext) {
	lsp = createLsp(ext);

	await lsp.start();

	/** @type {Ctx} */
	const ctx = {ext, lsp};

	createTreeView(ctx);
	initWebView(ctx);
};

exports.deactivate = function () {
	if (lsp) {
		return lsp.stop();
	}
};
