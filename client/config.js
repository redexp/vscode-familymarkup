const {workspace, env} = require('vscode');

module.exports = {
	getSettings,
	toggleSetting,
};

function getConfig() {
	return workspace.getConfiguration("familymarkup");
}

function getLocale() {
	return env.language.replace(/^([a-z]{2}).+$/, '$1');
}

function getSettings() {
	const c = getConfig();

	const data = {
		locale: getLocale(),
		warnChildrenWithoutRelations: c.get('childrenWithoutRelationships'),
		inlineMarkdownLink: c.get('inlineMarkdownLink'),
	};

	console.log(data)

	return data;
}

function toggleSetting(name) {
	const c = getConfig();
	const v = c.get(name);

	return c.update(name, !v);
}