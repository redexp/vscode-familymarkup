import Two from 'two.js';
import {ZUI} from 'two.js/extras/jsm/zui';
import type {Group} from "two.js/src/group";

export default function panZoom(root: Two, stage: Group) {
	const node = root.renderer.domElement;
	const zui = new ZUI(stage);
	const mouse = new Two.Vector();
	let touches = {};
	let distance = 0;

	zui.addLimits(0.06, 8);

	node.addEventListener('mousedown', mousedown, false);
	node.addEventListener('mousewheel', mousewheel, false);
	node.addEventListener('wheel', mousewheel, false);

	node.addEventListener('touchstart', touchstart, false);
	node.addEventListener('touchmove', touchmove, false);
	node.addEventListener('touchend', touchend, false);
	node.addEventListener('touchcancel', touchend, false);

	function mousedown(e: MouseEvent) {
		mouse.x = e.clientX;
		mouse.y = e.clientY;
		window.addEventListener('mousemove', mousemove, false);
		window.addEventListener('mouseup', mouseup, false);
	}

	function mousemove(e: MouseEvent) {
		const dx = e.clientX - mouse.x;
		const dy = e.clientY - mouse.y;
		zui.translateSurface(dx, dy);
		mouse.set(e.clientX, e.clientY);
	}

	function mouseup() {
		window.removeEventListener('mousemove', mousemove, false);
		window.removeEventListener('mouseup', mouseup, false);
	}

	function mousewheel(e: WheelEvent) {
		const dy = -e.deltaY / 1000;
		zui.zoomBy(dy, e.clientX, e.clientY);
	}

	function touchstart(e: TouchEvent) {
		switch (e.touches.length) {
		case 2:
			pinchStart(e);
			break;
		case 1:
			panStart(e)
			break;
		}
	}

	function touchmove(e: TouchEvent) {
		switch (e.touches.length) {
		case 2:
			pinchMove(e);
			break;
		case 1:
			panMove(e)
			break;
		}
	}

	function touchend(e: TouchEvent) {
		touches = {};
		const touch = e.touches[0];
		if (touch) {  // Pass through for panning after pinching
			mouse.x = touch.clientX;
			mouse.y = touch.clientY;
		}
	}

	function panStart(e: TouchEvent) {
		const touch = e.touches[0];
		mouse.x = touch.clientX;
		mouse.y = touch.clientY;
	}

	function panMove(e: TouchEvent) {
		const touch = e.touches[0];
		const dx = touch.clientX - mouse.x;
		const dy = touch.clientY - mouse.y;
		zui.translateSurface(dx, dy);
		mouse.set(touch.clientX, touch.clientY);
	}

	function pinchStart(e: TouchEvent) {
		const {dx, dy, a} = expandTouch(e);
		distance = Math.sqrt(dx * dx + dy * dy);
		mouse.x = dx / 2 + a.clientX;
		mouse.y = dy / 2 + a.clientY;
	}

	function pinchMove(e: TouchEvent) {
		const {dx, dy} = expandTouch(e);
		const d = Math.sqrt(dx * dx + dy * dy);
		const delta = d - distance;
		zui.zoomBy(delta / 250, mouse.x, mouse.y);
		distance = d;
	}

	function expandTouch(e: TouchEvent) {
		for (let i = 0; i < e.touches.length; i++) {
			const touch = e.touches[i];
			touches[touch.identifier] = touch;
		}
		const a = touches[0];
		const b = touches[1];
		const dx = b.clientX - a.clientX;
		const dy = b.clientY - a.clientY;

		return {dx, dy, a, b};
	}
}