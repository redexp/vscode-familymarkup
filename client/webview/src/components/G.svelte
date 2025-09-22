<script lang="ts">
    import type {Snippet} from 'svelte';

    interface Props {
        left?: number,
        top?: number,
        class?: string,
        children: Snippet,
    }

    let {left = 0, top = 0, children, ...rest}: Props = $props();
</script>

<g transform={`translate(${left},${top})`} {...rest}>
    {@render children()}
</g>