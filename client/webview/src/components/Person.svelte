<script lang="ts">
    import {send} from '../lib/api';

    interface Props {
		id?: any,
		name: string,
		x: number,
		y: number,
		width: number,
		height: number,
	}

    let {id, x, y, width, height, name}: Props = $props();

	function onClick() {
        send("person", {id});
	}
</script>

<g
    class="person"
    transform={`translate(${x - width / 2},${y - height / 2})`}
    onclick={onClick}
    role="button"
    tabindex="0"
>
    <rect
        width={width}
        height={height}
    />

    <text
        x={width / 2}
        y={height / 2 + 4}
        text-anchor="middle"
    >{name}</text>
</g>