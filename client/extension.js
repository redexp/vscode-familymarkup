const {join} = require('path');
const {LanguageClient, TransportKind} = require('vscode-languageclient/node');
const {window} = require('vscode');
const FamilyTree = require('./FamilyTree');

/** @type {LanguageClient} */
let client;

exports.activate = function (ctx) {
	const binPath = ctx.asAbsolutePath(
		join('server', 'main')
	);
	const logPath = ctx.asAbsolutePath(
		join('server', 'debug.log')
	);

	client = new LanguageClient(
		'familymarkup',
		'FamilyMarkup',
		{
			run: {
				command: binPath,
				transport: TransportKind.stdio,
			},
			debug: {
				command: binPath,
				args: [`--log-file=${logPath}`, '--log-clear', `--log-level=2`],
				transport: TransportKind.stdio,
			},
		},
		{
			documentSelector: [{
				scheme: 'file',
				language: 'familymarkup',
			}],
		}
	);

	client.start();

	window.registerTreeDataProvider('families', new FamilyTree(client));
};

exports.deactivate = function () {
	if (client) {
		return client.stop();
	}
};