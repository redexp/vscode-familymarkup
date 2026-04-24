import type {Element} from "@svgdotjs/svg.js";
import {zoom} from '../app.ts';

let pan = false;

zoom.on('pan', function () {
	pan = true;
});

const mousedown = () => {
	pan = false;
};

export default function onClick(node: Element, cb: (e: Event) => void) {
	node.on('mousedown', mousedown);
	node.on('click', function (e) {
		if (pan) return;

		cb(e);
	});
}