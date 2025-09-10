<script lang="ts">
import Bezier from "./Bezier.svelte";
import Person from "./Person.svelte";
import G from './G.svelte';
import {style} from '../lib/tree';
import type {SvgFamily} from "../types";

interface Props {
    family: SvgFamily
}

let {family}: Props = $props();
</script>

<G class="family" top={family.top}>
    <rect
        x={0}
        y={0}
        width={family.width}
        height={family.height}
        class="bg"
    />

    <G
        top={style.family.padding.y + style.family.title.fontSize}
        left={style.family.padding.x}
    >
        {#each family.rows as row}
            <rect
                x={row.left}
                y={row.top}
                width={row.right - row.left}
                height={style.person.height + style.family.padding.y * 2}
                fill="#ccc"
            />
        {/each}

        <text
            x={family.title.x + family.title.width / 2}
            y={family.title.y}
            font-size={style.family.title.fontSize}
            class="title"
        >{family.title.name}</text>

        {#each family.roots as root}
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
</G>