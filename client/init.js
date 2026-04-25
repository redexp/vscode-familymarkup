const {commands} = require('vscode');
const createTreeView = require("./treeview/create");
const initWebView = require("./webview/init");
const open = require('./commands/open');
const {findPerson} = require('./commands/findPerson');

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

	registerCommands(ctx);
	createTreeView(ctx);
	initWebView(ctx);
}

/**
 * @param {Ctx} ctx
 */
function registerCommands(ctx) {
	const {ext} = ctx;

	ext.subscriptions.push(
		commands.registerCommand('familymarkup.open', (params) => open(ctx, params))
	);

	ext.subscriptions.push(
		commands.registerCommand('familymarkup.findPerson', () => findPerson(ctx))
	);
}