const {join} = require('path');
const {LanguageClient, TransportKind} = require('vscode-languageclient/node');
const {getSettings} = require('./config');
const {wasmOptions, createUriConverters} = require('./wasm');

/**
 * @param {import('vscode').ExtensionContext} ext
 * @returns {import('vscode-languageclient').LanguageClient}
 */
module.exports = function createLspNode(ext) {
	let serverOptions = {};

	const clientOptions = {
		documentSelector: [{
			scheme: 'file',
			language: 'familymarkup',
		}],
		initializationOptions: getSettings(),
	};

	switch (process.env.TRANSPORT) {
	case 'ws':
		serverOptions.debug = {
			module: ext.asAbsolutePath(join('client', 'ipc-ws-proxy.js')),
			transport: TransportKind.ipc,
		};
		break;

	case 'bin':
		const {platform, arch} = process;

		const filename = platform + '-' + arch + (platform === 'win32' ? '.exe' : '');

		const binPath = ext.asAbsolutePath(
			join('server', filename)
		);

		serverOptions.debug = {
			command: binPath,
			transport: TransportKind.stdio,
		};
		break;

	default: // wasm
		serverOptions = () => wasmOptions(ext);
		clientOptions.uriConverters = createUriConverters();
	}

	return new LanguageClient(
		'familymarkup',
		'FamilyMarkup',
		serverOptions,
		clientOptions
	);
};