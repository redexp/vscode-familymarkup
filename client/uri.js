/**
 * @param {Ctx} ctx
 * @param {string} uri
 * @return {import('vscode').Uri}
 */
module.exports = function toUri(ctx, uri) {
	return ctx.lsp.protocol2CodeConverter.asUri(uri);
};