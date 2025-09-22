<script lang="ts">
    import {send} from '../lib/api';
    import type {Rect} from '../types';

    interface Props {
        id?: any,
        name: string,
        rect: Rect,
    }

    const {id, name, rect}: Props = $props();
    const {x, y, width, height} = rect;

    function onClick() {
        send("person", {id});
    }
</script>

<g
    class="person"
    transform={`translate(${x},${y})`}
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