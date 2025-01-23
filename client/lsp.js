const {join} = require('path');
const {LanguageClient, TransportKind} = require('vscode-languageclient/node');
const {window, workspace, env, Uri} = require('vscode');
const FamilyTree = require('./FamilyTree');

/**
 * @param {import('vscode').ExtensionContext} ctx 
 */
module.exports.initClient = async function (ctx) {
    const {platform, arch} = process;

	const filename = platform + '-' + arch + (platform === 'win32' ? '.exe' : '');

	const binPath = ctx.asAbsolutePath(
		join('server', filename)
	);

	const exist = await workspace.fs.stat(Uri.file(binPath)).catch(() => null);

	if (!exist) {
		await window.showErrorMessage(`
			Sorry, we not support ${platform} OS with ${arch} yet. 
			Please, create issue and we will try to build it.
			Right now you have only syntax highlighting.`, { modal: true });
		return;
	}

	const logPath = ctx.asAbsolutePath(
		join('server', 'debug.log')
	);

	const debugConfig = (
		process.env.IPC_WS_PROXY ?
			{
				module: ctx.asAbsolutePath(join('client', 'ipc-ws-proxy.js')),
				transport: TransportKind.ipc,
			} : {
				command: binPath,
				argv: ["--log-file=" + logPath, "--log-level=2", "--log-clear"],
				transport: TransportKind.stdio,
			}
	);

	client = new LanguageClient(
		'familymarkup',
		'FamilyMarkup',
		{
			run: {
				command: binPath,
				transport: TransportKind.stdio,
			},
			debug: debugConfig,
		},
		{
			documentSelector: [{
				scheme: 'file',
				language: 'familymarkup',
			}],
			initializationOptions: getSettings(),
		}
	);

	client.start();

	const treeView = window.createTreeView('families', {
		treeDataProvider: new FamilyTree(ctx, client),
	});

	const updateTreeTitle = () => {
		const locale = getLocale();

		treeView.title = (
			locale === 'uk' ?
				'Сімʼї' :
			locale === 'ru' ?
				'Семъи' :
				'Families'
		);
	};

	const sendConfig = () => {
		return client.sendNotification('config/change', getSettings());
	};

	updateTreeTitle();

	onConfiguration('locale', () => {
		updateTreeTitle();
		sendConfig();
	});

	onConfiguration('childrenWithoutRelationships', sendConfig);

	return client;
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

function getSettings() {
	return {
		locale: getLocale(),
		warnChildrenWithoutRelations: getConfig().get('childrenWithoutRelationships'),
	};
}

function onConfiguration(selector, cb) {
	workspace.onDidChangeConfiguration(e => {
		if (!e.affectsConfiguration('familymarkup.' + selector)) return;

		cb();
	});
}