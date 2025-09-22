import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import assetsListPlugin from './src/lib/assets-plugin';

export default defineConfig({
	plugins: [svelte(), assetsListPlugin()],
	build: {
		outDir: './dist'
	},
});
