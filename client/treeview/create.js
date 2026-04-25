const {window} = require('vscode');
const FamilyTree = require('./FamilyTree');
const {getSettings, onConfiguration} = require('../config');

module.exports = function createTreeView(ctx) {
	window.createTreeView('families', {
		treeDataProvider: new FamilyTree(ctx),
	});

	const sendConfig = () => {
		return ctx.lsp.sendNotification('config/change', getSettings());
	};

	onConfiguration('locale', sendConfig);
	onConfiguration('childrenWithoutRelationships', sendConfig);
};