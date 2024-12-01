const {join, resolve} = require('path');
const {LanguageClient, TransportKind} = require('vscode-languageclient/node');
const {window, workspace, env} = require('vscode');
const FamilyTree = require('./FamilyTree');
const highlight = require('./highlight');

/** @type {LanguageClient} */
let client;

/**
 * @param {import('vscode').ExtensionContext} ctx 
 */
exports.activate = async function (ctx) {
	const locale = getLocale();

	const binPath = ctx.asAbsolutePath(
		join('server', process.platform === 'win32' ? 'main.exe' : 'main')
	);

	const logPath = ctx.asAbsolutePath(
		join('server', 'debug.log')
	);

	client = new LanguageClient(
		'familymarkup',
		'FamilyMarkup',
		{
			run: {
				command: binPath,
				transport: TransportKind.stdio,
			},
			debug: {
				command: binPath,
				args: [`--log-file=${logPath}`, '--log-clear', `--log-level=2`],
				transport: TransportKind.stdio,
			},
		},
		{
			documentSelector: [{
				scheme: 'file',
				language: 'familymarkup',
			}],
			initializationOptions: {
				locale,
			},
		}
	);

	client.start();

	const treeView = window.createTreeView('families', {
		treeDataProvider: new FamilyTree(ctx, client),
	});

	const updateTreeTitle = () => {
		treeView.title = (
			locale === 'uk' ?
				'Сімʼї' :
			locale === 'ru' ?
				'Семъи' :
				'Families'
		);
	};

	const sendConfig = () => {
		return client.sendNotification('config/change', {
			locale: getLocale(),
		});
	}

	updateTreeTitle();

	onConfiguration('locale', () => {
		updateTreeTitle();
		sendConfig();
	});

	await highlight.init({
		locateFamilyMarkupWasm(name) {
			return ctx.asAbsolutePath(join('node_modules', 'highlight-familymarkup', name));
		}
	});

	return {
		extendMarkdownIt(md) {
			return md.use(highlight);
		}
	};
};

exports.deactivate = function () {
	if (client) {
		return client.stop();
	}
};

function getConfig() {
	return workspace.getConfiguration("familymarkup");
}

function getLocale() {
	let locale = getConfig().get("locale")

	if (locale === "editor") {
		locale = env.language.replace(/^([a-z]{2}).+$/, '$1');
	}

	return locale;
}

function onConfiguration(selector, cb) {
	workspace.onDidChangeConfiguration(e => {
		if (!e.affectsConfiguration('familymarkup.' + selector)) return;

		cb();
	});
}