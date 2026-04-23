const {window} = require('vscode');
const {showGraph, send} = require('./showGraph');

exports.pickPersons = pickPersons;

/**
 * @typedef {import('vscode').QuickPickItem & {position: import('vscode').Position}} PathPerson
 */

/** @type {import('vscode').QuickPick<PathPerson>} */
let qp;

/** @type {PathPerson[]} */
let selected = [];

/**
 * @param {Ctx} ctx
 */
function pickPersons(ctx) {
	qp = window.createQuickPick();
	qp.title = '😀 ➡️ 🎯'
	qp.placeholder = 'Name Surname';
	qp.prompt = '1️⃣ First person';
	qp.canSelectMany = false;
	qp.matchOnDescription = true;
	qp.enableCharacterFilter = true;
	qp.items = [];

	qp.show();
	qp.onDidHide(() => {
		qp.dispose();
		qp = null;
		selected = [];
	});

	let requestId;

	qp.onDidChangeValue(() => {
		const id = requestId = Math.random();

		qp.busy = true;

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
		})
		.finally(function () {
			if (id !== requestId) return;

			qp.busy = false;
		})
	});

	qp.onDidChangeSelection((items) => {
		if (items.length === 0) return;

		addPerson(items[0]);

		if (selected.length > 1) {
			loading(createPath(ctx));
		}
	});

	const [uri, word] = getCurrentWord();

	if (!word) return;

	loading(setFirstPersonByPos(ctx, uri, word.start));
}

/**
 * @param {Ctx} ctx
 * @return {Promise<*>}
 */
async function createPath(ctx) {
	const [path] = await Promise.all([
		getPath(ctx),
		showGraph(ctx),
	]);

	send('path', {path});
}

/**
 * @return {[string, import('vscode').Range]}
 */
function getCurrentWord() {
	const editor = window.visibleTextEditors[0];

	if (!editor) return [];

	const doc = editor.document;
	const selection = editor.selection;
	const range = selection && doc.getWordRangeAtPosition(selection.active);

	return [doc.uri.toString(true), range];
}

/**
 * @param {Promise<*>} p
 */
function loading(p) {
	qp.busy = true;

	p.finally(() => {
		if (!qp) return;

		qp.busy = false;
	});
}

/**
 * @param {Ctx} ctx
 * @param {string} uri
 * @param {import('vscode').Position} pos
 * @return {Promise<void>}
 */
async function setFirstPersonByPos(ctx, uri, pos) {
	/** @type {import('vscode').SymbolInformation} */
	const symbol = await ctx.lsp.sendRequest('workspaceSymbol/member', {
		URI: uri,
		position: pos,
	});

	if (!symbol) return;

	addPerson(symbolToQuickPick(symbol));
}

/**
 * @param {PathPerson} person
 */
function addPerson(person) {
	if (!qp) return;

	selected.push(person);

	const format = (s) => s.label + ' ' + s.description;
	let title = format(selected[0]) + ' ➡️ ';

	if (selected.length > 1) {
		title += format(selected[1]);
		qp.prompt = '';
	}
	else {
		title += '🎯';
		qp.prompt = '2️⃣ Second person';
	}

	qp.value = '';
	qp.title = title;
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
 * @return {Promise<import('../src/types').SvgPathPerson[]>}
 */
async function getPath(ctx) {
	const res = await ctx.lsp.sendRequest('svg/path', {
		persons: selected.map(item => ({
			uri: item.resourceUri,
			position: item.position,
		}))
	});

	return res.path;
}