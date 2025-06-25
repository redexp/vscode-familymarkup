const {workspace, env} = require('vscode');

module.exports = {
	getConfig,
	getLocale,
	getSettings,
	onConfiguration,
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