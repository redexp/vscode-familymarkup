const {window} = require('vscode');
const FamilyTree = require('./FamilyTree');
const {getLocale, getSettings, onConfiguration} = require('./config');

module.exports = function createLanguageClient({
	ctx,
	Constructor,
	serverOptions,
	clientOptions,
}) {
	const client = new Constructor(
		'familymarkup',
		'FamilyMarkup',
		serverOptions,
		clientOptions
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