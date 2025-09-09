<script lang="ts">
    interface Props {
        from: {x?: number, y?: number},
        to: {x?: number, y?: number},
	}

	let {from, to}: Props = $props();
</script>

<line
    class="line"
    x1={from.x}
    y1={from.y}
    x2={to.x}
    y2={to.y}
/>