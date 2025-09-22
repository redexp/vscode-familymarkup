<script lang="ts">
    import Bezier from "./Bezier.svelte";
    import Person from "./Person.svelte";
    import G from './G.svelte';
    import type {SvgFamily, SvgPerson} from "../types";

    interface Props {
        family: SvgFamily
    }

    let {family}: Props = $props();

	const roots = family.roots.map(root => {
		const nodes: SvgPerson[] = [];
		const links: Array<{source: SvgPerson, target: SvgPerson}> = [];

		const walk = function (p: SvgPerson) {
			nodes.push(p);

			for (const child of p.children) {
				links.push({source: p, target: child});

				walk(child);
			}
		};

		walk(root.person);

		return {
			nodes,
            links,
        };
    });
</script>

<G class="family" left={family.x} top={family.y}>
    <rect
        x="0"
        y="0"
        width={family.width}
        height={family.height}
        fill="#ccc"
        stroke="#000"
        stroke-width="1"
    />

    <text
        class="title"
        x={family.title.x}
        y={family.title.y}
    >{family.title.name}</text>

    {#each roots as root}
        {#each root.links as {source, target}}
            <Bezier
                class="line"
                from={source}
                to={target}
            />
        {/each}

        {#each root.nodes as node}
            <Person
                rect={node}
                name={node.name}
            />
        {/each}
    {/each}
</G>