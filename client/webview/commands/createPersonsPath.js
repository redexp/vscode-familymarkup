const {window, l10n} = require('vscode');
const {showGraph, send} = require('./showGraph');
const {createSearchInput, symbolToQuickPick} = require('../../commands/findPerson');
const toUri = require('../../uri');

exports.createPersonsPath = createPersonsPath;

/** @type {import('vscode').QuickPick<PathPerson>} */
let qp;

/** @type {PathPerson[]} */
let selected;

/**
 * @param {Ctx} ctx
 */
function createPersonsPath(ctx) {
	selected = [];
	qp = createSearchInput(ctx);

	formatTitle();

	qp.onDidChangeSelection((items) => {
		if (items.length === 0) return;

		selected.push(items[0]);

		formatTitle();

		if (selected.length > 1) {
			createPath(ctx);
		}
	});

	qp.show();
	qp.onDidHide(() => {
		qp = null;
	});

	const [uri, word] = getCurrentWord();

	if (!word) return;

	getPersonByPos(ctx, uri, word.start)
	.then(function (p) {
		if (!p || selected.length > 0) return;

		selected.push(p);
		formatTitle();
	});
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
 * @param {Ctx} ctx
 * @param {string} uri
 * @param {import('vscode').Position} pos
 * @return {Promise<PathPerson|null>}
 */
async function getPersonByPos(ctx, uri, pos) {
	/** @type {import('vscode').SymbolInformation} */
	const symbol = await ctx.lsp.sendRequest('workspaceSymbol/member', {
		URI: uri,
		position: pos,
	});

	if (!symbol) return null;

	return symbolToQuickPick(symbol);
}

function formatTitle() {
	if (!qp) return;

	if (selected.length === 0) {
		qp.title = '1️⃣  ➡️ 2️⃣ '
		qp.prompt = '1️⃣ ' + l10n.t('First person');
		return;
	}

	/**
	 * @param {PathPerson} s
	 * @return {string}
	 */
	const format = (s) => s.label + ' ' + s.description;

	let title = format(selected[0]) + ' ➡️ ';

	if (selected.length > 1) {
		title += format(selected[1]);
		qp.prompt = '';
	}
	else {
		title += '2️⃣ ';
		qp.prompt = '2️⃣ ' + l10n.t('Second person');
	}

	qp.title = title;
}

/**
 * @param {Ctx} ctx
 * @return {Promise<import('../src/types').SvgPathPerson[]>}
 */
async function getPath(ctx) {
	/** @type {{path: SvgPathPerson[]}} */
	const res = await ctx.lsp.sendRequest('svg/path', {
		persons: selected.map(item => ({
			uri: item.location.uri,
			position: item.location.range.start,
		})),
	});

	for (const p of res.path) {
		p.uri = toUri(ctx, p.uri).toString(true);
	}

	return res.path;
}