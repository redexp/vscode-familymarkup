const createLspWeb = require('./lsp-web');
const createTreeView = require('./treeview/createTreeView');
const initWebView = require('./webview/init');

let lsp;

/**
 * @param {import('vscode').ExtensionContext} ext
 */
exports.activate = async function (ext) {
	lsp = createLspWeb(ext);

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