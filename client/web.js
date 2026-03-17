const createLspWeb = require('./lsp-web');
const init = require("./init");

let lsp;

/**
 * @param {import('vscode').ExtensionContext} ext
 */
exports.activate = async function (ext) {
	lsp = createLspWeb(ext);

	await init(ext, lsp);
};

exports.deactivate = function () {
	if (lsp) {
		return lsp.stop();
	}
};