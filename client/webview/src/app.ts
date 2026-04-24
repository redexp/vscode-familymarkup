import createPanZoom from 'panzoom';
import {SVG} from '@svgdotjs/svg.js';
import {send, onEvent} from './lib/api';
import zoomStep from './controllers/zoomStep.ts';

export const root = SVG().addTo(document.body);
export const stage = root.group();
export const families = stage.group().addClass('families');
export const pointers = stage.group().addClass('pointers');
export const paths = stage.group().addClass('paths');

resize();

export const zoom = createPanZoom(stage.node, {
	minZoom: 0.1,
	maxZoom: 10,
	onDoubleClick: () => false,
});

zoom.on('zoom', function() {
	const {scale: value} = zoom.getTransform();

	console.log('zoom', value);

	send('zoom', {zoom: value});
	zoomStep(value, stage);
});

onEvent(function (e) {
	if (e.type !== 'zoom') return;

	const {x, y} = zoom.getTransform();

	zoom.smoothZoomAbs(x, y, e.zoom);
	zoomStep(e.zoom, stage);
});

window.addEventListener('resize', resize);

function resize() {
	const w = window.innerWidth;
	const h = window.innerHeight;

	root.size(w, h);
	root.viewbox(0, 0, w, h);
}

export function clearAll() {
	families.clear();
	pointers.clear();
	paths.clear();
}