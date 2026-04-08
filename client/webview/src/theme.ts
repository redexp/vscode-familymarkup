export const FONT_SIZE = 12;
export const POINTER_COLOR = '#e85d75';

let canvas: HTMLCanvasElement;

export function getFontRatio() {
	updateThemeFont();

	return themeFont.ratio;
}

export const themeFont = {
	family: '',
	ratio: 0,
};

export function updateThemeFont() {
	const {fontFamily} = window.getComputedStyle(document.body);

	if (themeFont.family === fontFamily) return;

	themeFont.family = fontFamily;

	if (!canvas) {
		canvas = document.createElement('canvas');
	}

	const ctx = canvas.getContext('2d');
	const size = 12;

	ctx.font = size + `px ` + themeFont.family;
	const {width} = ctx.measureText('X');

	themeFont.ratio = width / size;
}

export function textWidth(text: string, size: number = FONT_SIZE) {
	return text.length * themeFont.ratio * size;
}

export const themeColors: ThemeColors = {
	family: {
		foreground: '#000',
		background: '#fafdff',
	},
	person: {
		foreground: '#000',
		background: '#fff',
	},
	unknown: {
		foreground: '#710000',
		background: '#fff',
	},
	separator: {
		foreground: '#000',
		background: '#fff',
	},
};

export function setThemeColors(colors: ThemeColors) {
	Object.assign(themeColors, colors);
}

export type ThemeColors = Record<'family' | 'person' | 'unknown' | 'separator', ThemeStyle>;

export type ThemeStyle = {
	foreground: string,
	background?: string,
	fontStyle?: string,
};