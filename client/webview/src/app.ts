// @ts-ignore
import svgPanZoom from 'svg-pan-zoom';
import {SVG} from '@svgdotjs/svg.js';

export const root = SVG().addTo(document.body);
export const stage = root.group().addClass('svg-pan-zoom_viewport');
export const families = stage.group().addClass('families');
export const pointers = stage.group().addClass('pointers');

resize();

export const zoom = svgPanZoom(root.node, {
	minZoom: 0.1,
	maxZoom: 10,
	zoomScaleSensitivity: 0.3,
	dblClickZoomEnabled: false,
});

window.addEventListener('resize', resize);

function resize() {
	const w = window.innerWidth;
	const h = window.innerHeight;

	root.size(w, h);
	root.viewbox(0, 0, w, h);
}