const data = JSON.parse(document.getElementById('data').innerHTML);

export const FONT_FAMILY = data.fontFamily;
export const COLOR = '#4a90e2';

export function getFontRatio() {
	document.body.style.fontFamily = FONT_FAMILY;

	const ctx = document.createElement('canvas').getContext('2d');
	const size = 12;

	ctx.font = size + `px ` + FONT_FAMILY;
	const {width} = ctx.measureText('X');

	return width / size;
}