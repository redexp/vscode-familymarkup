const {window, l10n} = require('vscode');
const open = require('./open');

/**
 * @param {Ctx} ctx
 */
module.exports.findPerson = findPerson;
module.exports.createSearchInput = createSearchInput;
module.exports.symbolToQuickPick = symbolToQuickPick;

/**
 * @param {Ctx} ctx
 */
function findPerson(ctx) {
	const qp = createSearchInput(ctx, {onlyMembers: false});

	qp.onDidChangeSelection(function (items) {
		if (items.length === 0) return;

		qp.hide();

		const p = items[0];

		open(ctx, {
			uri: p.location.uri.toString(true),
			...p.location.range.start,
			toCharacter: p.location.range.end.character,
		});
	});

	qp.show();
}

/**
 * @typedef {import('vscode').QuickPickItem & {location: import('vscode').Location}} PathPerson
 * @typedef {import('vscode').SymbolInformation & {details?: string}} PersonSymbol
 */

/**
 * @param {Ctx} ctx
 * @param {{onlyMembers?: boolean}} [searchParams]
 */
function createSearchInput(ctx, searchParams = {}) {
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

		searchSymbols(ctx, qp.value, searchParams)
		.then(function (list) {
			if (id !== requestId) return;

			if (selected.length > 0) {
				list = list.filter(item => {
					const uri = item.location.uri;
					const pos = item.location.range.start;

					for (const p of selected) {
						if (
							uri === p.location.uri &&
							pos.line === p.location.range.start.line &&
							pos.character === p.location.range.start.character
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
 * @param {PersonSymbol} symbol
 * @return {PathPerson}
 */
function symbolToQuickPick(symbol) {
	/** @type {PathPerson} */
	const item = {
		alwaysShow: true,
		label: symbol.name,
		location: symbol.location,
	};

	if (symbol.kind === 8 && symbol.containerName) {
		item.description = symbol.containerName;
	}

	if (symbol.kind === 8 && symbol.details) {
		item.detail = symbol.details;
	}

	return item;
}

/**
 * @param {Ctx} ctx
 * @param {string} query
 * @param {{onlyMembers?: boolean}} searchParams
 * @return {Promise<PersonSymbol[]>}
 */
function searchSymbols(ctx, query, searchParams) {
	if (!query.trim()) return Promise.resolve([]);

	return ctx.lsp.sendRequest("workspace/symbol", {
		exactMatch: true,
		onlyMembers: true,
		...searchParams,
		query,
	});
}