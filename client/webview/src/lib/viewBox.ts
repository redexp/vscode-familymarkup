let svg: SVGElement;
let startEvent: PointerEvent;
let initRect: ViewRect;
let curRect: ViewRect;

function init(node: SVGElement) {
	if (svg) return;

	svg = node;
	curRect = getViewRect(svg);
}

function updateViewBox() {
	svg.setAttribute(
		'viewBox',
		curRect.x + ' ' + curRect.y + ' ' + curRect.width + ' ' + curRect.height
	);
}

export function onMouseWheel(e: WheelEvent) {
	e.preventDefault();

	init(e.currentTarget as SVGElement);

	const delta = e.deltaY * 0.5;

	const mouseX = (e.clientX / svg.clientWidth) * curRect.width + curRect.x;
	const mouseY = (e.clientY / svg.clientHeight) * curRect.height + curRect.y;

	const width = Math.round(curRect.width + delta);
	const height = width / curRect.ratio;

	const scaleX = width / curRect.width;
	const scaleY = height / curRect.height;

	curRect.x = mouseX - (mouseX - curRect.x) * scaleX;
	curRect.y = mouseY - (mouseY - curRect.y) * scaleY;

	curRect.width = width;
	curRect.height = height;

	updateViewBox();
}

export function onPointerDown(e: PointerEvent) {
	if (e.button === 2) return;

	init(e.currentTarget as SVGElement);

	startEvent = e;
	initRect = {...curRect};

	document.addEventListener('pointermove', onPointerMove);
	document.addEventListener('pointerup', onPointerUp);
}

function onPointerUp() {
	startEvent = null;
	initRect = null;

	document.removeEventListener('pointermove', onPointerMove);
	document.removeEventListener('pointerup', onPointerUp);
}

function onPointerMove(e: PointerEvent) {
	e.preventDefault();

	const dx = (e.clientX - startEvent.clientX) / (svg.clientWidth / curRect.width);
	const dy = (e.clientY - startEvent.clientY) / (svg.clientHeight / curRect.height);

	curRect.x = initRect.x - dx;
	curRect.y = initRect.y - dy;

	updateViewBox();
}

function getViewRect(svg: SVGElement): ViewRect {
	let viewBox = svg.getAttribute('viewBox');

	if (!viewBox) {
		viewBox = `0 0 ${svg.clientWidth} ${svg.clientHeight}`;
		svg.setAttribute('viewBox', viewBox);
	}

	const [x, y, width, height] = viewBox.split(' ').map(v => Number(v));

	return {
		x, y,
		width, height,
		ratio: width / height,
	};
}

type ViewRect = {
	x: number,
	y: number,
	width: number,
	height: number,
	ratio: number,
};