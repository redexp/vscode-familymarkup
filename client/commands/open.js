const {ViewColumn, commands, Selection} = require("vscode");
const toUri = require('../uri');

/**
 * @param {Ctx} ctx
 * @param {{uri: string, line: number, character: number, toCharacter?: number}} params
 */
module.exports = function open(ctx, params) {
	const {line, character: from} = params;
	const to = params.toCharacter || from;

	return commands.executeCommand('vscode.open', toUri(ctx, params.uri), {
		viewColumn: ViewColumn.One,
		selection: new Selection(line, from, line, to),
	});
};