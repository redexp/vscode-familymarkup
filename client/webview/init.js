const {commands, window, workspace, ViewColumn, Uri} = require('vscode');
const assets = require('./assets.json');

/**
 * @param {Ctx} ctx
 */
module.exports = function initWebView(ctx) {
	let view;

	const command = commands.registerCommand('familymarkup.showGraph', () => {
		if (view) {
			updateWebView(ctx, view);
			return;
		}

		view = updateWebView(ctx);

		view.onDidDispose(() => {
			view = null;
		});
	});

	ctx.ext.subscriptions.push(command);
}

/**
 * @param {Ctx} ctx
 * @param {import('vscode').WebviewPanel} [view]
 * @returns {import('vscode').WebviewPanel}
 */
function updateWebView(ctx, view) {
	const send = (type, data = {}) => {
		return view.webview.postMessage({
			...data,
			type,
		});
	};

	if (view) {
		view.reveal(ViewColumn.One);
		return view;
	}

	// const uri = window.activeTextEditor?.document.uri.toString();

	view = createWebView(ctx);

	view.webview.onDidReceiveMessage(function (e) {
		switch (e.type) {
		case 'ready':
			ctx.lsp
			.sendRequest('svg/families', {
				fontRatio: e.fontRatio,
			})
			.then(function (families) {
				return send('families', {families});
			})
			.catch(logErr);
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

	return view;
}

function logErr(err) {
	console.error('webview', err);
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