import {roundCommands, type SVGCommand} from "svg-round-corners";
import type {BoundingPath, Row} from '../types';

export const style = {
	family: {
		title: {
			fontSize: 16,
		},

		padding: {
			y: 20,
			x: 20,
		},
		gap: 15,
	},
	person: {
		height: 30,
		padding: {y: 20},
		margin: {x: 10, bottom: 20},
	},
};

function alignRows(name: string, rows: Row[]): Row[] {
	const first = rows[0];
	const nameWidth = name.length * style.family.title.fontSize * 0.65;

	const title: Row = {
		top: first.top - style.family.title.fontSize,
		left: first.left + (first.right - first.left) / 2 - nameWidth / 2,
		right: nameWidth,
		bottom: first.top,
	};

	title.right += title.left;

	rows.unshift(title);

	const len = rows.length;

	if (len === 1) return rows;

	let minLeft = Number.MAX_VALUE;
	let maxRight = Number.MIN_VALUE;
	let minLeftIndex = 0;
	let maxRightIndex = 0;

	rows.sort(function (a, b) {
		return a.top - b.top;
	});

	for (let i = 0; i < len; i++) {
		const row = rows[i];

		row.top -= style.family.padding.y;
		row.left -= style.family.padding.x;
		row.right += style.family.padding.x;

		if (row.left < minLeft) {
			minLeft = row.left;
			minLeftIndex = i;
		}

		if (row.right > maxRight) {
			maxRight = row.right;
			maxRightIndex = i;
		}
	}

	let prevLeft = rows[0].left;
	let prevRight = rows[0].right;

	for (let i = 1; i < len; i++) {
		const row = rows[i];

		if (i < minLeftIndex && row.left > prevLeft) {
			row.left = prevLeft;
		}

		if (i < maxRightIndex && row.right < prevRight) {
			row.right = prevRight;
		}

		prevLeft = row.left;
		prevRight = row.right;
	}

	for (let i = len - 2; i >= 0; i--) {
		const row = rows[i];

		if (i > minLeftIndex && row.left > prevLeft) {
			row.left = prevLeft;
		}

		if (i > maxRightIndex && row.right < prevRight) {
			row.right = prevRight;
		}

		prevLeft = row.left;
		prevRight = row.right;
	}

	const MIN_STEP = 10;

	for (let i = 1; i < len; i++) {
		const row = rows[i];

		if (i > minLeftIndex && row.left - prevLeft < MIN_STEP) {
			row.left = prevLeft;
		}

		if (i > maxRightIndex && prevRight - row.right < MIN_STEP) {
			row.right = prevRight;
		}

		prevLeft = row.left;
		prevRight = row.right;
	}

	for (let i = len - 2; i >= 0; i--) {
		const row = rows[i];

		if (i < minLeftIndex && row.left - prevLeft < MIN_STEP) {
			row.left = prevLeft;
		}

		if (i - maxRightIndex && prevRight - row.right < MIN_STEP) {
			row.right = prevRight;
		}

		prevLeft = row.left;
		prevRight = row.right;
	}

	return rows;
}

function createBoundingPath(rows: Row[]): BoundingPath {
	const points: SVGCommand[] = [];

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];
		const next = rows[i + 1];
		const prevY = i == 0 ? row.top : points[points.length - 1].values.y;

		points.push({
			marker: 'L',
			values: {
				x: row.left,
				y: prevY,
			},
		});

		if (next && next.left <= row.left) {
			points.push({
				marker: 'L',
				values: {
					x: row.left,
					y: next.top,
				},
			});
		}
		else {
			points.push({
				marker: 'L',
				values: {
					x: row.left,
					y: row.bottom,
				},
			});
		}
	}

	for (let i = rows.length - 1; i >= 0; i--) {
		const row = rows[i];
		const next = rows[i - 1];
		const prevY = points[points.length - 1].values.y;

		points.push({
			marker: 'L',
			values: {
				x: row.right,
				y: prevY,
			},
		});

		if (next && row.right <= next.right) {
			points.push({
				marker: 'L',
				values: {
					x: row.right,
					y: next.bottom,
				},
			});
		}
		else {
			points.push({
				marker: 'L',
				values: {
					x: row.right,
					y: row.top,
				},
			});
		}
	}

	const first = points[0];

	first.marker = 'M';

	points.push({...first, marker: 'Z'});

	return roundCommands(points, 10);
}