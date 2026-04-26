const {commands, window} = require('vscode');
const {showGraph, start} = require('./commands/showGraph');
const {createPersonsPath} = require('./commands/createPersonsPath');

/**
 * @param {Ctx} ctx
 */
module.exports = function initWebView(ctx) {
	ctx.ext.subscriptions.push(
		commands.registerCommand('familymarkup.showGraph', () => showGraph(ctx))
	);

	ctx.ext.subscriptions.push(
		commands.registerCommand('familymarkup.createPersonsPath', () => createPersonsPath(ctx))
	);

	window.registerWebviewPanelSerializer('familymarkup', {
		deserializeWebviewPanel(panel) {
			start(ctx, panel);
		}
	});
}
