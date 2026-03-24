const {commands, Selection, ViewColumn} = require('vscode');
const createTreeView = require("./treeview/create");
const initWebView = require("./webview/init");

/**
 * @param {import('vscode').ExtensionContext} ext
 * @param {import('vscode-languageclient').LanguageClient} lsp
 */
module.exports = async function init(ext, lsp) {
	await lsp.start();

	/** @type {Ctx} */
	const ctx = {
		ext,
		lsp,
	};

	initFamilyOpen(ctx);
	createTreeView(ctx);
	initWebView(ctx);
}

/**
 * @param {Ctx} ctx
 */
function initFamilyOpen(ctx) {
	const {lsp, ext} = ctx;

	const command = commands.registerCommand('familytree.open', ({uri, line, character}) => {
		uri = lsp.protocol2CodeConverter.asUri(uri);

		commands.executeCommand('vscode.open', uri, {
			viewColumn: ViewColumn.One,
			selection: new Selection(line, character, line, character),
		});
	});

	ext.subscriptions.push(command);
}