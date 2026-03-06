import {defineConfig} from 'vite';
import assetsListPlugin from './src/lib/assets-plugin';

export default defineConfig({
	plugins: [assetsListPlugin()],
	build: {
		outDir: './dist'
	},
});
