const {commands, window, workspace, ViewColumn, Uri} = require('vscode');
const assets = require('./assets.json');
const {onHighlights} = require('../middleware');

/** @type {import('vscode').WebviewPanel} */
let view;

/**
 * @param {Ctx} ctx
 */
module.exports = function initWebView(ctx) {
	const command = commands.registerCommand('familymarkup.showGraph', () => {
		if (view) {
			view.reveal(ViewColumn.Two);
			return;
		}

		initView(ctx);
		listenFileChange(ctx);
		listenSelection(ctx);
		listenHighlight();

		view.onDidDispose(() => {
			view = null;
		});
	});

	ctx.ext.subscriptions.push(command);
}

/**
 * @param {Ctx} ctx
 */
function initView(ctx) {
	// const uri = window.activeTextEditor?.document.uri.toString();

	view = createWebView(ctx);

	view.webview.onDidReceiveMessage(function (e) {
		switch (e.type) {
		case 'ready':
			updateFamilies(ctx, e.fontRatio).catch(logErr);
			break;

		case 'open':
			commands.executeCommand('familytree.open', {
				uri: e.uri,
				line: e.line,
				character: e.char,
			});
			break;
		}
	});
}

/**
 * @param {Ctx} ctx
 */
function listenFileChange(ctx) {
	const extList = ctx.ext.extension.packageJSON?.contributes.languages[0].extensions || ['fml', 'family'];

	if (extList.length === 0) {
		throw new Error('empty languages extensions array');
	}

	const watcher = workspace.createFileSystemWatcher(
		'**/*.{' + extList.map(ext => ext.replace('.', '')).join(',') + '}'
	);

	const TIMEOUT = 1000;
	let changeTime = null;

	const onFileChange = function () {
		changeTime = Date.now();
	};

	watcher.onDidChange(onFileChange);
	watcher.onDidCreate(onFileChange);
	watcher.onDidDelete(onFileChange);

	ctx.ext.subscriptions.push(watcher);

	const timer = setInterval(function () {
		if (
			!changeTime ||
			updateFamilies.pending ||
			Date.now() - changeTime < TIMEOUT
		) {
			return;
		}

		changeTime = null;

		updateFamilies(ctx).catch(logErr);
	}, 500);

	view.onDidDispose(() => clearInterval(timer));
}

/**
 * @param {Ctx} ctx
 */
function listenSelection(ctx) {
	const listener = window.onDidChangeTextEditorSelection(function (e) {
		const uri = e.textEditor.document.uri.toString(true);
		const selections = e.selections.filter(s => !s.isEmpty);

		if (selections.length === 0) return;

		send('selection', {
			uri,
			selections,
		});
	});

	ctx.ext.subscriptions.push(listener);
}

function listenHighlight() {
	const off = onHighlights(function (highlights) {
		send('highlights', {highlights});
	});

	view.onDidDispose(off);
}

/**
 * @param {Ctx} ctx
 */
function createWebView({ext}) {
	const panel = window.createWebviewPanel(
		'familymarkup',
		'Family View',
		ViewColumn.Two,
		{
			enableScripts: true,
			retainContextWhenHidden: true,
		}
	);

	const getPath = (...parts) => (
		panel.webview.asWebviewUri(
			Uri.joinPath(ext.extensionUri, 'client', 'webview', 'dist', 'assets', ...parts)
		)
	);

	panel.webview.html = tpl(getPath);

	return panel;
}

function tpl(getPath) {
	const assetsCss = (
		assets
		.filter(file => file.endsWith('css'))
		.map(file => `<link rel="stylesheet" crossorigin href="${getPath(file)}">`)
	);

	const assetsJs = (
		assets
		.filter(file => file.endsWith('js'))
		.map(file => `<script type="module" crossorigin src="${getPath(file)}"></script>`)
	);

	const fontFamily = workspace.getConfiguration("editor").get('fontFamily', 'monospace');

	const data = {fontFamily};

	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Family View</title>
    ${assetsCss.join('')}
</head>
<body>
<div id="root"></div>
<script id="data" type="text/json">${JSON.stringify(data)}</script>
${assetsJs.join('')}
</body>
</html>`;
}

function logErr(err) {
	console.error('webview', err);
}

/**
 * @param {string} type
 * @param {object} data
 */
function send(type, data) {
	view.webview.postMessage({
		...data,
		type,
	});
}

/**
 * @param {Ctx} ctx
 * @param {number} [fontRatio]
 */
function updateFamilies(ctx, fontRatio) {
	if (!fontRatio) {
		fontRatio = updateFamilies.fontRatio;
	}
	else {
		updateFamilies.fontRatio = fontRatio;
	}

	if (!fontRatio) {
		return Promise.reject(new Error('updateFamilies no fontRatio'));
	}

	updateFamilies.pending = (
		ctx.lsp
		.sendRequest('svg/families', {fontRatio})
		.then(list => send('families', {families: list}))
		.finally(() => {
			updateFamilies.pending = null;
		})
	);

	return updateFamilies.pending;
}