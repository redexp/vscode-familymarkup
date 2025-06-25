const {LanguageClient} = require('vscode-languageclient/browser');
const {getSettings} = require('./config');
const {wasmOptions, createUriConverters} = require('./wasm');
const createLanguageClient = require('./createLanguageClient');

let client;

exports.activate = async function (ctx) {
	client = await createLanguageClient({
		ctx,
		Constructor: LanguageClient,
		serverOptions: () => wasmOptions(ctx),
		clientOptions: {
			documentSelector: [{
				scheme: 'file',
				language: 'familymarkup',
			}],
			initializationOptions: getSettings(),
			uriConverters: createUriConverters(),
		},
	});
};

exports.deactivate = function () {
	if (client) {
		return client.stop();
	}
};