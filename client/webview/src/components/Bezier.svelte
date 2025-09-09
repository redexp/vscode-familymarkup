<script lang="ts">
type XY = {
	x?: number,
    y?: number,
};
interface Props {
    from: XY,
    to: XY,
    class?: string,
}

let {from, to, ...rest}: Props = $props();

const height = to.y - from.y;

const fromPoint = {
	x: from.x,
    y: from.y + height * 0.75,
};

const toPoint = {
	x: to.x,
    y: to.y - height * 0.75,
};

const xy = (p: XY) => Math.round(p.x) + ',' + Math.round(p.y);

const d = `M ${xy(from)} C ${xy(fromPoint)} ${xy(toPoint)} ${xy(to)}`;
</script>

<path
    d={d}
    {...rest}
/>