const {commands, window, workspace, ViewColumn, Uri} = require('vscode');
const assets = require('./assets.json');
const {onHighlights} = require('../middleware');
const {getUserTheme} = require('vscode-shiki-bridge');

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

		start(ctx);
	});

	ctx.ext.subscriptions.push(command);

	window.registerWebviewPanelSerializer('familymarkup', {
		deserializeWebviewPanel(panel) {
			start(ctx, panel);
		}
	});
}

/**
 * @param {Ctx} ctx
 * @param {import('vscode').WebviewPanel} [panel]
 */
function start(ctx, panel) {
	initView(ctx, panel);
	listenFileChange(ctx);
	listenSelection(ctx);
	listenHighlight();
	listenThemeChange();
}

/**
 * @param {Ctx} ctx
 * @param {import('vscode').WebviewPanel} [panel]
 */
function initView(ctx, panel) {
	view = panel || window.createWebviewPanel(
		'familymarkup',
		'Family View',
		ViewColumn.Two,
		{
			enableScripts: true,
			retainContextWhenHidden: true,
		}
	);

	const getPath = (...parts) => (
		view.webview.asWebviewUri(
			Uri.joinPath(ctx.ext.extensionUri, 'client', 'webview', 'dist', 'assets', ...parts)
		)
	);

	view.webview.html = tpl(getPath);

	view.webview.onDidReceiveMessage(function (e) {
		switch (e.type) {
		case 'ready':
			updateThemeColors()
			.then(async function () {
				await updateFamilies(ctx, e.fontRatio);

				const editor = window.visibleTextEditors[0];

				if (!editor) return;

				const doc = editor.document;
				const uri = doc.uri.toString(true);
				const selection = editor.selection;
				const range = selection && doc.getWordRangeAtPosition(selection.active);

				send('uri', {
					uri,
					selection: range && {
						start: range.start,
						end: range.end,
					},
				});
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

	view.onDidDispose(() => {
		view = null;
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
		const doc = e.textEditor.document;
		const uri = doc.uri.toString(true);
		const selections = e.selections.filter(s => !s.isEmpty);

		if (selections.length === 0) {
			if (
				e.selections.length === 0 ||
				e.selections.some(s => !doc.getWordRangeAtPosition(s.active))
			) {
				send('highlights', {
					uri,
					highlights: [],
				});
			}

			return;
		}

		send('selection', {
			uri,
			selections,
		});
	});

	ctx.ext.subscriptions.push(listener);
}

function listenHighlight() {
	const off = onHighlights(function (uri, highlights) {
		send('highlights', {
			uri,
			highlights,
		});
	});

	view.onDidDispose(off);
}

function listenThemeChange() {
	const listener = window.onDidChangeActiveColorTheme(function () {
		updateThemeColors();
	});

	const l2 = workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('workbench.colorTheme')) {
			updateThemeColors();
		}
	});

	view.onDidDispose(function () {
		listener.dispose();
		l2.dispose();
	});
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

	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Family View</title>
    ${assetsCss.join('')}
</head>
<body>
<div id="root"></div>
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

async function updateThemeColors() {
	const [_themeName, data] = await getUserTheme();
	const list = data?.[0]?.settings;
	const colors = data?.[0]?.colors;

	const map = [
		['family', [
			'entity.name.class',
			'entity.name.type.class',
			'entity.name.type',
		]],
		['person', [
			'variable.property',
			'variable.other.property',
			'variable.other',
			'variable',
		]],
		['unknown', [
			'string.unknown',
			'string',
		]],
		['separator', [
			'keyword.operator',
			'keyword',
		]],
	];
	const result = new Map();
	let defStyle;

	for (let {scope: themeScopes, settings} of list) {
		if (!themeScopes) {
			defStyle = settings;
			continue;
		}

		if (!Array.isArray(themeScopes)) {
			themeScopes = [themeScopes];
		}

		for (const themeScope of themeScopes) {
			for (const [type, lookingScopes] of map) {
				for (const scope of lookingScopes) {
					if (scope === themeScope) {
						result.set(scope + '.' + type, settings);
					}
				}
			}
		}
	}

	const theme = {};

	for (const [type, scopes] of map) {
		for (const scope of scopes) {
			if (result.has(scope + '.' + type)) {
				theme[type] = result.get(scope + '.' + type);
				break;
			}
		}

		if (!theme[type]) {
			theme[type] = {};
		}

		if (defStyle) {
			for (const [prop, value] of Object.entries(defStyle)) {
				if (!theme[type][prop]) {
					theme[type][prop] = value;
				}
			}
		}
	}

	if (colors) {
		for (const [type] of map) {
			if (!theme[type].foreground) {
				theme[type].foreground = colors["editor.foreground"];
			}
			if (!theme[type].background) {
				theme[type].background = colors["editor.background"];
			}
		}
	}

	send('theme', {colors: theme});
}