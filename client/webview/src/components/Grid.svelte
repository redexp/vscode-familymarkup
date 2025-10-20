<script lang="ts">
	interface Props {
		step: number,
	}

	const {step}: Props = $props();
	const fromX = -1000;
	const fromY = -1000;
	const toX = 1000;
	const toY = 1000;
	const steps = new Array(Math.round((toX - fromX) / step));

</script>

<g class="grid">
    {#each steps as _s, i}
        <line
            x1={fromX + step * i}
            y1={fromY}
            x2={fromX + step * i}
            y2={toY}
        />
        <line
            x1={fromX}
            y1={fromY + step * i}
            x2={toX}
            y2={fromY + step * i}
        />
    {/each}
</g>