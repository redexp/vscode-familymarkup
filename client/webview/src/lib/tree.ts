import {roundCommands, type SVGCommand} from "svg-round-corners";
import type {BoundingPath, SvgFamily} from '../types';

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

export function createBoundingPath(f: SvgFamily): BoundingPath {
	const points: SVGCommand[] = f.bounding.map(p => ({
		marker: 'L',
		values: p,
	}));

	const first = points[0];

	first.marker = 'M';

	points.push({...first, marker: 'Z'});

	return roundCommands(points, 10);
}