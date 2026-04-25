const {ViewColumn, commands, Selection} = require("vscode");

/**
 * @param {Ctx} ctx
 * @param {{uri: string, line: number, character: number, toCharacter?: number}} params
 */
module.exports = function open(ctx, params) {
	const {line, character: from} = params;
	const uri = ctx.lsp.protocol2CodeConverter.asUri(params.uri);
	const to = params.toCharacter || from;

	return commands.executeCommand('vscode.open', uri, {
		viewColumn: ViewColumn.One,
		selection: new Selection(line, from, line, to),
	});
};