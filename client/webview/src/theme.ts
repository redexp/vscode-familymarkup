export const MAIN_COLOR = '#4a90e2';
export const POINTER_COLOR = '#e85d75';

export function getFontRatio() {
	const {fontFamily} = window.getComputedStyle(document.body);

	const ctx = document.createElement('canvas').getContext('2d');
	const size = 12;

	ctx.font = size + `px ` + fontFamily;
	const {width} = ctx.measureText('X');

	return width / size;
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