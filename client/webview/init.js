const {commands, window, ViewColumn, Uri} = require('vscode');

const CSS_FILE = 'index-BxU4qd9X.css';
const JS_FILE = 'index-aWDLvxB-.js';

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

	const uri = window.activeTextEditor?.document.uri.toString();

	view = createWebView(ctx);

	view.webview.onDidReceiveMessage(function (e) {
		switch (e.type) {
		case 'ready':
			if (!uri) return;

			ctx.lsp
			.sendRequest('graph/document', {uri})
			.then(function (families) {
				for (const family of families) {
					for (const p of family.rootPersons) {
						flattenChildren(p);
					}
				}

				return send('document', {families});
			})
			.catch(logErr);

			break;
		}
	});

	return view;
}

/**
 * @param {GraphItem} p
 * @returns {GraphItem}
 */
function flattenChildren(p) {
	p.children = [];

	if (!p.relations) return p;

	for (const rel of p.relations) {
		/** @type {GraphItem} */
		let prev = p;

		if (rel.partners?.length > 0) {
			for (const partner of rel.partners) {
				const item = {
					name: partner.name,
					children: [],
				}

				prev.children.push(item);
				prev = item;
			}
		}

		for (const child of rel.children) {
			prev.children.push(flattenChildren(child));
		}
	}

	return p;
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
			enableScripts: true
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
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Family View</title>
    <link rel="stylesheet" crossorigin href="${getPath(CSS_FILE)}">
    <script type="module" crossorigin src="${getPath(JS_FILE)}"></script>
</head>
<body>
<div id="root"></div>
</body>
</html>`;
}