const {TreeItem, EventEmitter} = require('vscode');

class FamilyTree {
	/**
	 * @param {import('vscode-languageclient/node').LanguageClient} client
	 */
	constructor(client) {
		this.client = client;

		const reloadEmitter = new EventEmitter()

		this.onDidChangeTreeData = reloadEmitter.event;

		client.onNotification('tree/reload', function () {
			reloadEmitter.fire();
		});
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
		return new TreeItem(item.label || item.name, item.type === "member" ? 0 : 1);
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
		const list = await this.request('tree/relations', {family_id: family.id});

		return assignToAll(list.filter(r => r.arrow === "="), {
			type: "relation",
			family_id: family.id,
		});
	}

	/**
	 * @param {TreeRelation} relation
	 * @returns {Promise<TreeMember[]>}
	 */
	async getMembers(relation) {
		const list = await this.request('tree/members', {
			family_id: relation.family_id,
			relation_id: relation.id,
		});

		return addType(list, "member");
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