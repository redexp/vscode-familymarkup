type NamedTreeItem = {
	name: string,
	aliases: string[],
}

type TreeItemPoint = {
	row: number,
	column: number,
}

type TreeFamily = NamedTreeItem & TreeItemPoint & {
	type: "family",
	uri: string,
}

type TreeRelation = TreeItemPoint & {
	type: "relation",
	label: string,
	arrow: string,
	family: TreeFamily,
}

type TreeMember = NamedTreeItem & TreeItemPoint & {
	type: "member",
	family: TreeFamily,
}