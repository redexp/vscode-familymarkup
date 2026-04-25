const {workspace, env} = require('vscode');

module.exports = {
	getSettings,
	onConfiguration,
};

function getConfig() {
	return workspace.getConfiguration("familymarkup");
}

function getLocale() {
	return env.language.replace(/^([a-z]{2}).+$/, '$1');
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