const {commands, Position, Location, Range} = require("vscode");
const open = require('./open');
const toUri = require("../uri");

/**
 * @param {Ctx} ctx
 * @param {string} uri
 * @param {import('vscode').Position} pos
 * @param {import('vscode').Location[]} locations
 * @return {Thenable<unknown>}
 */
module.exports = function codeLens(ctx, uri, pos, locations) {
	if (locations.length === 1) {
		return open(ctx, {
			uri: locations[0].uri,
		});
	}

	return commands.executeCommand(
		'editor.action.peekLocations',
		toUri(ctx, uri),
		new Position(pos.line, pos.character),
		locations.map(l => (
			new Location(
				toUri(ctx, l.uri),
				new Range(
					0, 0,
					10, 0
				)
			)
		)),
		'peek'
	);
}