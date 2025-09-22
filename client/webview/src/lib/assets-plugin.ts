import type {Plugin} from "vite";
import {writeFile} from 'node:fs/promises';

export default function assetsListPlugin(): Plugin {
	return {
		name: "vite-plugin-assets-list",

		generateBundle(_, bundle) {
			const assets: string[] = [];

			for (const file of Object.keys(bundle)) {
				if (file.match(/^assets\/.+\.(js|css)$/)) {
					assets.push(file.replace('assets/', ''));
				}
			}

			writeFile('assets.json', JSON.stringify(assets));
		},
	};
}