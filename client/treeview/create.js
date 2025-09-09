const {window} = require('vscode');
const FamilyTree = require('./FamilyTree');
const {getLocale, getSettings, onConfiguration} = require('../config');

module.exports = function (ctx) {
	const treeView = window.createTreeView('families', {
		treeDataProvider: new FamilyTree(ctx),
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
		return ctx.lsp.sendNotification('config/change', getSettings());
	};

	updateTreeTitle();

	onConfiguration('locale', () => {
		updateTreeTitle();
		sendConfig();
	});

	onConfiguration('childrenWithoutRelationships', sendConfig);
};