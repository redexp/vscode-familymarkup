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

    <text
        x={family.width / 2}
        y={style.family.padding.y}
        font-size={style.family.title.fontSize}
    >{family.name}</text>

    {#each family.roots as root}
        <G top={root.top} left={root.left}>
            {#each root.links as {source, target}}
                <Bezier
                    class="line"
                    from={source}
                    to={target}
                />
            {/each}

            {#each root.nodes as d}
                <Person
                    x={d.x}
                    y={d.y}
                    width={d.data.width}
                    height={d.data.height}
                    name={d.data.name}
                />
            {/each}
        </G>
    {/each}
</G>