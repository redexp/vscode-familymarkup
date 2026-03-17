const {TreeItem, EventEmitter} = require('vscode');

class FamilyTree {
	/**
	 * @param {Ctx} ctx
	 */
	constructor({lsp}) {
		this.lsp = lsp;

		const reloadEmitter = new EventEmitter()

		// noinspection JSUnusedGlobalSymbols
		this.onDidChangeTreeData = reloadEmitter.event;

		lsp.onNotification('tree/reload', function () {
			reloadEmitter.fire();
		});
	}

	request(method, params) {
		return this.lsp.sendRequest(method, params);
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

		ti.id = item.id;

		ti.command = {
			title: 'show',
			command: 'familytree.open',
			arguments: [{
				uri: item.uri || item.family.uri,
				line: item.line,
				character: item.char,
			}],
		};

		return ti;
	}

	/**
	 * @returns {Promise<TreeFamily[]>}
	 */
	async getFamilies() {
		const list = await this.request('tree/families');
		const names = new Map();

		for (const item of list) {
			if (names.has(item.name)) {
				names.set(item.name, names.get(item.name) + 1);
			}
			else {
				names.set(item.name, 1);
			}

			item.id = item.name + ":" + names.get(item.name);
		}

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
			line: family.line,
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
	async getMembers({family, line}) {
		const list = await this.request('tree/members', {
			uri: family.uri,
			family_name: family.name,
			line,
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