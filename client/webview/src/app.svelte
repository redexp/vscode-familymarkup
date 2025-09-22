<script lang="ts">
    import {onMount} from 'svelte';
	import {onEvent, send} from './lib/api';
	import {onPointerDown, onMouseWheel} from './lib/viewBox';
	import Family from './components/Family.svelte';
	import type {SvgFamily} from './types';

	let families: SvgFamily[] = $state([]);

	onEvent((e) => {
		switch (e.type) {
		case 'document':
			families = e.families;
			break;
		}
    });

	onMount(() => {
		const data = JSON.parse(document.getElementById('data').innerHTML);
		const ctx = document.createElement('canvas').getContext('2d');

        const size = 12;
		ctx.font = size + `px ` + data.fontFamily;
		const {width} = ctx.measureText('X');

		send('ready', {
			fontRatio: width/size,
        });
    });
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