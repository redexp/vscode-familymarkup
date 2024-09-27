const {TreeItem, EventEmitter, commands, Uri, Selection} = require('vscode');

class FamilyTree {
	/**
	 * @param {import('vscode-languageclient/node').ExtensionContext} ctx
	 * @param {import('vscode-languageclient/node').LanguageClient} client
	 */
	constructor(ctx, client) {
		this.client = client;

		const reloadEmitter = new EventEmitter()

		this.onDidChangeTreeData = reloadEmitter.event;

		client.onNotification('tree/reload', function () {
			reloadEmitter.fire();
		});

		ctx.subscriptions.push(
			commands.registerCommand('familytree.open', async (item) => {
				const pos = await this.request('tree/location', item);

				commands.executeCommand('vscode.open', Uri.parse(item.uri), {
					selection: new Selection(pos, pos),
				});
			})
		);
	}

	request(method, params) {
		return this.client.sendRequest(method, params);
	}

	/**
	 * @param {TreeFamily | TreeRelation | TreeMember} item
	 */
	getChildren(item) {
		if (!item) {
			return this.getFamilies();
		}

		switch (item.type) {
		case "family":
			return this.getRelations(item);
		case "relation":
			return this.getMembers(item);
		default:
			return [];
		}
	}

	/**
	 * @param {TreeFamily | TreeRelation | TreeMember} item
	 * @returns {import('vscode').TreeItem}
	 */
	getTreeItem(item) {
		const ti = new TreeItem(item.label || item.name, item.type === "member" ? 0 : 1);

		ti.command = {
			title: 'show',
			command: 'familytree.open',
			arguments: [{
				uri: item.uri || item.family.uri,
				row: item.row,
				column: item.column,
			}],
		};

		return ti;
	}

	/**
	 * @returns {Promise<TreeFamily[]>}
	 */
	async getFamilies() {
		const list = await this.request('tree/families');
		return addType(list, "family");
	}

	/**
	 * @param {TreeFamily} family
	 * @returns {Promise<TreeRelation[]>}
	 */
	async getRelations(family) {
		const list = await this.request('tree/relations', {
			uri: family.uri,
			family_name: family.name,
			row: family.row,
		});

		return assignToAll(list.filter(r => r.arrow === "="), {
			type: "relation",
			family,
		});
	}

	/**
	 * @param {TreeRelation} relation
	 * @returns {Promise<TreeMember[]>}
	 */
	async getMembers({family, row}) {
		const list = await this.request('tree/members', {
			uri: family.uri,
			family_name: family.name,
			row,
		});

		return assignToAll(list, {
			type: "member",
			family,
		});
	}
}

function addType(list, type) {
	return assignToAll(list, {type});
}

function assignToAll(list, obj) {
	for (const item of list) {
		Object.assign(item, obj);
	}

	return list;
}

module.exports = FamilyTree;