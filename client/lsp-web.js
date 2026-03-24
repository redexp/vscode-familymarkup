const {LanguageClient} = require("vscode-languageclient/browser");
const {wasmOptions, createUriConverters} = require("./wasm");
const {getSettings} = require("./config");
const {middleware} = require('./middleware');

/**
 * @param {import('vscode').ExtensionContext} ext
 * @returns {import('vscode-languageclient').LanguageClient}
 */
module.exports = function createLspWeb(ext) {
	return new LanguageClient(
		'familymarkup',
		'FamilyMarkup',
		() => wasmOptions(ext),
		{
			documentSelector: [{
				scheme: 'file',
				language: 'familymarkup',
			}],
			initializationOptions: getSettings(),
			uriConverters: createUriConverters(),
			middleware,
		},
	);
}