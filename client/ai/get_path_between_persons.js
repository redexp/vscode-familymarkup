const {lm, LanguageModelToolResult, LanguageModelTextPart} = require('vscode');

/**
 * @param {Ctx} ctx
 */
module.exports = function registerGetPathBetweenPersons(ctx) {
	ctx.ext.subscriptions.push(
		lm.registerTool('get_path_between_persons', new PathBetweenPersons(ctx))
	);
};

/**
 * @typedef {{person1: {name: string, surname: string}, person2: {name: string, surname: string}}} PathBetweenPersonsParams
 */

class PathBetweenPersons {
	/**
	 * @param {Ctx} ctx
	 */
	constructor(ctx) {
		this.ctx = ctx;
	}

	/**
	 * @param {import('vscode').LanguageModelToolInvocationOptions<PathBetweenPersonsParams>} options
	 * @param {import('vscode').CancellationToken} token
	 * @return {Promise<import('vscode').LanguageModelToolResult>}
	 */
	async invoke(options, token) {
		const {person1, person2} = options.input;

		/** @type {{path: PersonSymbol[], error?: Error}} */
		const res = await this.ctx.lsp.sendRequest('workspaceSymbol/path', {
			persons: [person1, person2],
		}, token).catch(function (error) {
			if (error.message) {
				return {error: error.message};
			}

			throw error;
		});

		let {error} = res;

		if (error) {
			const [_, type, params] = String(error).match(/^(\w+) - (.+)/) || ['', '', ''];
			const values = params.match(/\d+/g).map(v => Number(v));
			const N = values[0] === 0 ? 'first' : 'second';

			switch (type) {
			case 'persons_length_invalid':
				error = 'expect two names but got ' + values[1];
				break;

			case 'name_required':
			case 'surname_required':
				error = (
					(type === 'name_required' ?
						'name' :
						'surname'
					) +
					' of ' + N + ' person is empty'
				);
				break;

			case 'member_not_found':
				error = `can't identify ${N} person by his surname`;
				break;

			case 'member_in_family_not_found':
				const [_, family, name] = params.match(/family ([^,]*), name (.*)/);
				error = `can't find ${N} person in family "${family}" by name "${name}"`;
				break;

			case 'graph_person_not_found':
				error = `both persons found in family tree but looks like ${N} person is not part of family relation, means this person is not parent or child, this person just have some connection like "friend" or "godfather"`;
				break;

			case 'path_not_found':
				error = `both persons found in family tree but they don't have any connections`
				break;

			default:
				throw new Error(error);
			}

			return new LanguageModelToolResult([
				new LanguageModelTextPart('Error: ' + error),
			]);
		}

		const {path} = res;
		const list = [];

		for (let i = 0; i < path.length - 1; i++) {
			const {name, details: type} = path[i];

			if (type === 'link') {
				path[i+1].name = name;
				continue;
			}

			list.push(name + ' is a ' + type + ' of ' + path[i+1].name);
		}

		return new LanguageModelToolResult([
			new LanguageModelTextPart(list.join(', ')),
		]);
	}
}