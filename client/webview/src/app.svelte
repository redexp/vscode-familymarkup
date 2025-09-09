<script lang="ts">
    import {onMount} from 'svelte';
	import {onEvent, send} from './lib/api';
	import {createSvgFamilies} from './lib/tree';
	import {onPointerDown, onMouseWheel} from './lib/viewBox';
	import Family from './components/Family.svelte';
	import type {GraphFamily, SvgFamily} from './types';

	let families: SvgFamily[] = $state([]);

	onEvent((e) => {
		switch (e.type) {
		case 'document':
			families = createSvgFamilies(e.families as GraphFamily[]);
			break;
		}
    });

	onMount(() => send('ready'));
</script>

<svg
    onpointerdown={onPointerDown}
    onwheel={onMouseWheel}
>
    {#each families as f}
        <Family
            family={f}
        />
    {/each}
</svg>