<script lang="ts">
import type {Rect} from '../types';

interface Props {
    from: Rect,
    to: Rect,
    class?: string,
}

type XY = Pick<Rect, 'x' | 'y'>;

const {from, to, ...rest}: Props = $props();

const height = to.y - from.y;

const a: XY = {
	x: from.x + from.width / 2,
    y: from.y + from.height / 2,
};

const d: XY = {
	x: to.x + to.width / 2,
    y: to.y + to.height / 2,
};

const b = {
	x: a.x,
    y: a.y + height * 0.75,
};

const c = {
	x: d.x,
    y: d.y - height * 0.75,
};

const xy = (p: XY) => Math.round(p.x) + ',' + Math.round(p.y);

const path = `M ${xy(a)} C ${xy(b)} ${xy(c)} ${xy(d)}`;
</script>

<path
    d={path}
    {...rest}
/>