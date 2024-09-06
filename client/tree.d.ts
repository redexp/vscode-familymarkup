type TreeFamily = {
	type: "family",
	id: string,
	name: string,
	aliases: string[],
}

type TreeRelation = {
	type: "relation",
	id: string,
	family_id: TreeFamily['id'],z
	label: string,
	arrow: string,
}

type TreeMember = {
	type: "member",
	name: string,
	aliases: string[],
}