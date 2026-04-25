const {window, l10n} = require('vscode');
const open = require('./open');

/**
 * @param {Ctx} ctx
 */
module.exports.findPerson = findPerson;
module.exports.createSearchInput = createSearchInput;
module.exports.symbolToQuickPick = symbolToQuickPick;

function findPerson(ctx) {
	const qp = createSearchInput(ctx);

	qp.onDidChangeSelection(function (items) {
		if (items.length === 0) return;

		qp.hide();

		const p = items[0];

		open(ctx, {
			uri: p.resourceUri.toString(true),
			...p.position,
		});
	});

	qp.show();
}

/**
 * @typedef {import('vscode').QuickPickItem & {position: import('vscode').Position}} PathPerson
 */

/**
 * @param {Ctx} ctx
 */
function createSearchInput(ctx) {
	/** @type {PathPerson[]} */
	const selected = [];

	/** @type {import('vscode').QuickPick<PathPerson>} */
	const qp = window.createQuickPick();
	qp.placeholder = l10n.t('Name Surname');
	qp.canSelectMany = false;

	qp.onDidHide(() => qp.dispose());

	let requestId;

	qp.onDidChangeValue(() => {
		const id = requestId = Math.random();

		searchSymbols(ctx, qp.value)
		.then(function (list) {
			if (id !== requestId) return;

			if (selected.length > 0) {
				list = list.filter(item => {
					const uri = item.location.uri;
					const pos = item.location.range.start;

					for (const p of selected) {
						if (
							uri === p.resourceUri &&
							pos.line === p.position.line &&
							pos.character === p.position.character
						) {
							return false;
						}
					}

					return true;
				});
			}

			qp.items = list.map(symbolToQuickPick);
		});
	});

	qp.onDidChangeSelection((items) => {
		if (items.length === 0) return;

		selected.push(items[0]);

		qp.value = '';
	});

	return qp;
}

/**
 * @param {import('vscode').SymbolInformation} symbol
 * @return {PathPerson}
 */
function symbolToQuickPick(symbol) {
	return {
		alwaysShow: true,
		label: symbol.name,
		description: symbol.containerName,
		resourceUri: symbol.location.uri,
		position: symbol.location.range.start,
	};
}

/**
 * @param {Ctx} ctx
 * @param {string} query
 * @return {Promise<import('vscode').SymbolInformation[]>}
 */
function searchSymbols(ctx, query) {
	if (!query.trim()) return Promise.resolve([]);

	return ctx.lsp.sendRequest("workspace/symbol", {
		query,
		exactMatch: true,
		onlyMembers: true,
	});
}