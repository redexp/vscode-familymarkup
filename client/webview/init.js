const {commands, window, workspace, ViewColumn, Uri} = require('vscode');
const assets = require('./assets.json');

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
	return view.webview.postMessage({
		...data,
		type,
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
	let pending = false;

	const onFileChange = function () {
		changeTime = Date.now();
	};

	watcher.onDidChange(onFileChange);
	watcher.onDidCreate(onFileChange);
	watcher.onDidDelete(onFileChange);

	ctx.ext.subscriptions.push(watcher);

	const timer = setInterval(function () {
		if (!changeTime || pending || Date.now() - changeTime < TIMEOUT) return;

		changeTime = null;
		pending = true;

		updateFamilies(ctx)
		.catch(logErr)
		.then(() => {
			pending = false;
		});
	}, 500);

	view.onDidDispose(() => clearInterval(timer));
}

/**
 * @param {Ctx} ctx
 * @param {number} [fontRatio]
 */
async function updateFamilies(ctx, fontRatio) {
	if (!fontRatio) {
		fontRatio = updateFamilies.fontRatio;
	}
	else {
		updateFamilies.fontRatio = fontRatio;
	}

	if (!fontRatio) {
		console.warn('updateFamilies no fontRatio');
		return;
	}

	const families = await ctx.lsp.sendRequest('svg/families', {fontRatio});

	return send('families', {families});
}