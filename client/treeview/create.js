const {window} = require('vscode');
const FamilyTree = require('./FamilyTree');

module.exports = function createTreeView(ctx) {
	window.createTreeView('families', {
		treeDataProvider: new FamilyTree(ctx),
	});
};