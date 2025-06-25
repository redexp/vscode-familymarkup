const {workspace, Uri} = require('vscode');
const {createUriConverters} = require('@vscode/wasm-wasi-lsp');
const {Wasm} = require('@vscode/wasm-wasi/v1');
const {
	createStdioOptions,
	startServer,
} = require('@vscode/wasm-wasi-lsp');

module.exports = {
	wasmOptions,
	createUriConverters,
};

async function wasmOptions(context) {
	const wasm = await Wasm.load();

	const options = {
		stdio: createStdioOptions(),
		mountPoints: [{ kind: 'workspaceFolder' }]
	};

	const filename = Uri.joinPath(
		context.extensionUri,
		'server',
		'main.wasm'
	);
	const bits = await workspace.fs.readFile(filename);
	const module = await WebAssembly.compile(bits);

	// Create the wasm worker that runs the LSP server
	const process = await wasm.createProcess(
		'lsp-server',
		module,
		{ initial: 160, maximum: 160, shared: true },
		options
	);

	// Hook stderr to the output channel
	const decoder = new TextDecoder('utf-8');
	process.stderr.onData(data => {
		channel.append(decoder.decode(data));
	});

	return startServer(process);
}