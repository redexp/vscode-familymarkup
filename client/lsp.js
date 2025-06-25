const {join} = require('path');
const {LanguageClient, TransportKind} = require('vscode-languageclient/node');
const {getSettings} = require('./config');
const {wasmOptions, createUriConverters} = require('./wasm');
const createLanguageClient = require('./createLanguageClient');

/**
 * @param {import('vscode').ExtensionContext} ctx 
 */
module.exports.initClient = async function (ctx) {
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
			module: ctx.asAbsolutePath(join('client', 'ipc-ws-proxy.js')),
			transport: TransportKind.ipc,
		};
		break;

	case 'bin':
		const {platform, arch} = process;

		const filename = platform + '-' + arch + (platform === 'win32' ? '.exe' : '');

		const binPath = ctx.asAbsolutePath(
			join('server', filename)
		);

		serverOptions.debug = {
			command: binPath,
			transport: TransportKind.stdio,
		};
		break;

	default: // wasm
		serverOptions = () => wasmOptions(ctx);
		clientOptions.uriConverters = createUriConverters();
	}

	return createLanguageClient({
		ctx,
		Constructor: LanguageClient,
		serverOptions,
		clientOptions,
	});
};